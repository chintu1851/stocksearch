require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db.js');

const stockApiRoutes = require('./routes/stockApiRoutes.js');
const stockBatchRoutes = require('./routes/stockApiRoutes.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`PostgreSQL time: ${result.rows[0].now}`);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).send('Database query error');
  }
});
app.use(cors({
  origin: 'http://localhost:3001', // Your React frontend URL
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Routes
app.use('/api/stocks', stockApiRoutes);      // Single stock endpoint
app.use('/api/stocks', stockBatchRoutes);    // Batch stocks endpoint

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
