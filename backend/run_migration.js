const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'abc123',
  database: 'csr_esg_platform',
});

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ngo_gallery (
        id SERIAL PRIMARY KEY,
        ngo_id INT NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('OK: ngo_gallery');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_gallery (
        id SERIAL PRIMARY KEY,
        company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('OK: company_gallery');
    console.log('Migration complete');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
})();
