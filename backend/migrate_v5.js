const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost', port: 5432, user: 'postgres',
  password: 'abc123', database: 'csr_esg_platform',
});
(async () => {
  try {
    await pool.query("ALTER TABLE project_updates ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true");
    console.log('OK: is_public columns added');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
})();
