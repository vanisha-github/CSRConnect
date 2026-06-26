const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost', port: 5432, user: 'postgres',
  password: 'abc123', database: 'csr_esg_platform',
});
(async () => {
  try {
    await pool.query(
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false"
    );
    console.log('OK: added verified column to projects');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
})();
