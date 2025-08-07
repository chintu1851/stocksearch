require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'patelchintan',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'stocksearch',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(() => {
    console.log('✅ Connected to PostgreSQL!');
    console.log(`📊 Database: ${process.env.DB_NAME || 'stocksearch'}`);
    console.log(`👤 User: ${process.env.DB_USER || 'patelchintan'}`);
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection error:', err.message);
    console.error('🔧 Please check your database configuration in .env file');
  });

module.exports = pool;