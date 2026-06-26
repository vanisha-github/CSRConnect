const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost', port: 5432, user: 'postgres',
  password: 'abc123', database: 'csr_esg_platform',
});
(async () => {
  try {
    await pool.query(
      "ALTER TABLE project_updates ADD COLUMN IF NOT EXISTS company_comment TEXT"
    );
    await pool.query(
      "ALTER TABLE documents ADD COLUMN IF NOT EXISTS company_comment TEXT"
    );
    console.log('OK: added company_comment column to project_updates and documents');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
})();
