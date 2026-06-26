const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost', port: 5432, user: 'postgres',
  password: 'abc123', database: 'csr_esg_platform',
});
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
