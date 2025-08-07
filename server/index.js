require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { createServer } = require('http');
const { Server } = require('socket.io');
const pool = require('./config/db.js');
const winston = require('winston');
const path = require('path');

// Import routes
const stockApiRoutes = require('./routes/stockApiRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const watchlistRoutes = require('./routes/watchlistRoutes.js');
const settingsRoutes = require('./routes/settingsRoutes.js');
const portfolioRoutes = require('./routes/portfolioRoutes.js');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const port = process.env.PORT || 3001;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'stock-search-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.polygon.io", "ws://localhost:3001"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: () => 500, // begin adding 500ms of delay per request above 50
  validate: { delayMs: false } // disable warning
});

app.use(limiter);
app.use(speedLimiter);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'https://stocksearch.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Health check route
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'healthy',
            service: 'Stock Search API',
            timestamp: new Date().toISOString(),
            database: 'Connected',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || '1.0.0'
        });
    } catch (err) {
        logger.error('Database query error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Database connection error',
            timestamp: new Date().toISOString()
        });
    }
});

// API routes
app.use('/api/stocks', stockApiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/watchlists', watchlistRoutes);
app.use('/api/user', settingsRoutes);
app.use('/api/portfolio', portfolioRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join user to their personal room for real-time updates
    socket.on('join-user', (userId) => {
        socket.join(`user-${userId}`);
        logger.info(`User ${userId} joined their room`);
    });

    // Handle stock price updates
    socket.on('subscribe-stocks', (symbols) => {
        symbols.forEach(symbol => {
            socket.join(`stock-${symbol}`);
        });
        logger.info(`Client ${socket.id} subscribed to stocks: ${symbols.join(', ')}`);
    });

    // Handle watchlist updates
    socket.on('watchlist-update', (data) => {
        socket.to(`user-${data.userId}`).emit('watchlist-changed', data);
    });

    // Handle portfolio updates
    socket.on('portfolio-update', (data) => {
        socket.to(`user-${data.userId}`).emit('portfolio-changed', data);
    });

    // Handle real-time stock price updates
    socket.on('stock-price-update', (data) => {
        socket.to(`stock-${data.symbol}`).emit('price-updated', data);
    });

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Server error:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ 
            error: 'Invalid JSON payload',
            message: 'The request body contains invalid JSON'
        });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
            error: 'File too large',
            message: 'The uploaded file exceeds the maximum allowed size'
        });
    }

    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        message: `The requested route ${req.originalUrl} does not exist`,
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

server.listen(port, () => {
    logger.info(`🚀 Stock Search API running on port ${port}`);
    logger.info(`📊 Database: Connected to PostgreSQL`);
    logger.info(`🔐 Authentication: Session-based with JWT`);
    logger.info(`📈 Real-time data: Polygon API with WebSocket support`);
    logger.info(`🛡️ Security: Helmet, Rate Limiting, CORS enabled`);
    logger.info(`📝 Logging: Winston with file rotation`);
    logger.info(`⚡ Performance: Compression and caching enabled`);
});

module.exports = { app, server, io };
