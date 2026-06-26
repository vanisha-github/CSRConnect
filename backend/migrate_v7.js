const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT) || 5432, user: process.env.DB_USER || 'postgres', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'csr_esg_platform' }
);
(async () => {
  try {
    await pool.query(`
      UPDATE projects SET esg_pillar = 'environmental'
      WHERE esg_pillar IS NULL AND LOWER(category) IN ('plantation')
    `);
    await pool.query(`
      UPDATE projects SET esg_pillar = 'social'
      WHERE esg_pillar IS NULL AND LOWER(category) IN ('education', 'healthcare', 'women empowerment', 'skill development')
    `);
    await pool.query(`
      UPDATE projects SET esg_pillar = 'social'
      WHERE esg_pillar IS NULL
    `);
    console.log('OK: esg_pillar backfilled for existing projects');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
})();

