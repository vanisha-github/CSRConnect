const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT) || 5432, user: process.env.DB_USER || 'postgres', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'csr_esg_platform' }
);
(async () => {
  try {
    await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_end_date DATE");
    console.log('OK: actual_end_date on projects');
    console.log('Migration complete');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
})();

