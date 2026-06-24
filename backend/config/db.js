const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'csr_esg_platform',
  port: parseInt(process.env.DB_PORT) || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

const db = {
  query: async (text, params) => {
    const result = await pool.query(text, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      affectedRows: result.rowCount,
      insertId: result.rows?.[0]?.id ?? null,
    };
  },
  pool,
};

module.exports = db;
