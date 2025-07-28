const pool = require('../config/db');

async function getAllStocks() {
  const result = await pool.query('SELECT * FROM stocks ORDER BY id ASC');
  return result.rows;
}

module.exports = {
  getAllStocks,
};
