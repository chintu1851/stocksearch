# 📈 Stock Search Pro - Professional Stock Market Platform

A comprehensive, real-time stock market platform built with React, Node.js, and PostgreSQL. Features live data, portfolio management, technical analysis, and professional-grade UI/UX.

## 🚀 Live Demo

**Frontend**: http://localhost:3000  
**Backend API**: http://localhost:3001  
**Health Check**: http://localhost:3001/api/health

## ✨ Features

### 📊 Real-Time Stock Data
- Live price updates from Polygon API
- Real-time charts with technical indicators
- Batch stock loading (20 stocks simultaneously)
- Intelligent caching system
- Auto-refresh every 30 seconds

### 🎯 Market Analysis
- Market overview with major indices
- Sector performance visualization
- Technical and fundamental analysis
- Real-time market status
- Interactive charts with multiple timeframes

### 📰 News Center
- Real-time financial news
- Stock-specific news filtering
- Sentiment analysis
- News categorization and search

### 💼 Portfolio Management
- Portfolio tracking and analytics
- Multiple watchlists
- Performance metrics
- Real-time updates
- Portfolio allocation visualization

### 👤 User Management
- Secure authentication (JWT)
- User profiles and settings
- Session management
- Role-based access control

### 🛡️ Security & Performance
- Rate limiting and API protection
- CORS security
- Input validation and sanitization
- Comprehensive error handling
- Professional logging with Winston
- Compression and caching

### 🎨 Professional UI/UX
- Modern, responsive design
- Mobile-first approach
- Smooth animations
- Professional color scheme
- Intuitive navigation
- Loading states and error handling

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Tailwind CSS** - Utility-first CSS
- **Recharts** - Data visualization
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icon library
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Winston** - Logging
- **Helmet** - Security headers
- **Rate Limiting** - API protection

### APIs
- **Polygon API** - Real-time stock data
- **WebSocket** - Live updates
- **RESTful API** - Data endpoints

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stocksearch
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install --legacy-peer-deps
   
   # Install backend dependencies
   cd server
   npm install --legacy-peer-deps
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb stocksearch
   
   # Run database migrations
   psql -d stocksearch -f server/config/database.sql
   ```

5. **API Key Setup**
   - Get a free API key from [Polygon.io](https://polygon.io/)
   - Add it to your `.env` file:
     ```
     POLYGON_API_KEY=your_api_key_here
     ```

6. **Start the application**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start separately
   npm run client  # Frontend only
   npm run server  # Backend only
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/stocksearch

# API Keys
POLYGON_API_KEY=your_polygon_api_key_here

# Server
PORT=3001
NODE_ENV=development

# Client
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOCKET_URL=http://localhost:3001
```

### Database Schema

The application uses PostgreSQL with the following schema:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlists table
CREATE TABLE watchlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist items table
CREATE TABLE watchlist_items (
  id SERIAL PRIMARY KEY,
  watchlist_id INTEGER REFERENCES watchlists(id),
  symbol VARCHAR(10) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📡 API Endpoints

### Stock Data
- `GET /api/stocks/:symbol` - Get single stock data
- `GET /api/stocks/batch?symbols=AAPL,GOOGL` - Get batch stock data
- `GET /api/stocks/:symbol/chart` - Get chart data
- `GET /api/stocks/:symbol/details` - Get stock details
- `GET /api/stocks/:symbol/news` - Get stock news
- `GET /api/stocks/market` - Get market data
- `GET /api/stocks/cache` - Get cache status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Portfolio
- `GET /api/portfolio` - Get user portfolio
- `POST /api/portfolio/add` - Add stock to portfolio
- `DELETE /api/portfolio/remove` - Remove stock from portfolio

### Watchlists
- `GET /api/watchlists` - Get user watchlists
- `POST /api/watchlists` - Create watchlist
- `POST /api/watchlists/:id/add` - Add stock to watchlist
- `DELETE /api/watchlists/:id/remove` - Remove stock from watchlist

## 🎯 Usage Guide

### Getting Started

1. **Access the Application**
   - Open http://localhost:3000 in your browser
   - You'll see the main dashboard with live stock data

2. **Search for Stocks**
   - Use the search bar to find specific stocks
   - Enter symbols like AAPL, GOOGL, MSFT, etc.

3. **View Market Data**
   - Click on stock cards to view detailed analysis
   - Navigate to "Market Overview" for sector performance
   - Check "News Center" for latest financial news

4. **Manage Portfolio**
   - Go to "Portfolio Tracker" to manage your investments
   - Add stocks with purchase price and shares
   - Track performance and gains/losses

5. **Create Watchlists**
   - Use "Watchlist Manager" to create custom lists
   - Add stocks you want to monitor
   - Get real-time updates

### Real-Time Features

- **Live Updates**: Stock prices update automatically every 30 seconds
- **WebSocket Connection**: Real-time data streaming
- **Notifications**: Get alerts for price changes and news
- **Interactive Charts**: Zoom, pan, and analyze historical data

## 🧪 Testing

### API Testing
```bash
# Test health endpoint
curl http://localhost:3001

# Test stock data
curl http://localhost:3001/api/stocks/AAPL

# Test batch stocks
curl "http://localhost:3001/api/stocks/batch?symbols=AAPL,GOOGL,MSFT"
```

### Frontend Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Build backend
cd server && npm run build

# Start production server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
POLYGON_API_KEY=your_production_api_key
PORT=3001
```

## 📊 Performance Features

- **Caching**: Intelligent caching reduces API calls
- **Rate Limiting**: Prevents API abuse
- **Compression**: Gzip compression for faster loading
- **CDN Ready**: Static assets optimized for CDN
- **Lazy Loading**: Components load on demand
- **Virtual Scrolling**: Handles large datasets efficiently

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Sanitized user inputs
- **CORS Protection**: Cross-origin request security
- **Helmet Headers**: Security headers
- **SQL Injection Protection**: Parameterized queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your API key is valid
3. Ensure PostgreSQL is running
4. Check the logs in the `logs/` directory

## 🎉 Success!

Your Stock Search Pro platform is now running with:

✅ **Real-time stock data** from Polygon API  
✅ **Interactive charts** with technical indicators  
✅ **Portfolio management** with performance tracking  
✅ **News aggregation** with sentiment analysis  
✅ **User authentication** and session management  
✅ **Real-time notifications** and updates  
✅ **Professional UI/UX** design  
✅ **Security features** and rate limiting  
✅ **Error handling** and logging  
✅ **Responsive design** for all devices  

**🎯 This is now a complete, production-ready stock market platform!**

---

**Built with ❤️ using modern web technologies**
