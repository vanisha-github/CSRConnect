const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost', port: 5432, user: 'postgres',
  password: 'abc123', database: 'csr_esg_platform',
});
(async () => {
  try {
    await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500)");
    await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS objectives TEXT");
    await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS public_budget BOOLEAN DEFAULT true");
    await pool.query("ALTER TABLE ngos ADD COLUMN IF NOT EXISTS about TEXT");
    await pool.query("ALTER TABLE ngos ADD COLUMN IF NOT EXISTS website VARCHAR(255)");
    await pool.query("ALTER TABLE ngos ADD COLUMN IF NOT EXISTS operating_locations TEXT");
    await pool.query("ALTER TABLE ngos ADD COLUMN IF NOT EXISTS focus_areas TEXT");
    await pool.query("ALTER TABLE ngos ADD COLUMN IF NOT EXISTS years_of_experience INT DEFAULT 0");
    console.log('OK: all columns added');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
})();
