const express = require('express');
const router = express.Router();
const { getStockData, getBatchStocks } = require('../controllers/stockControllers');

router.get('/live', getStockData);          // Single stock
router.get('/batch', getBatchStocks);       // Multiple stocks

module.exports = router;


/* === FILE: server.js === */
require('dotenv').config();
// const express = require('express');
const cors = require('cors');
const pool = require('../config/db');
const stockApiRoutes = require('../routes/stockApiRoutes');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));
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

app.use('/api/stocks', stockApiRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
