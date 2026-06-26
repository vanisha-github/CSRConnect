const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT) || 5432, user: process.env.DB_USER || 'postgres', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'csr_esg_platform' }
);
(async () => {
  try {
    // NGO field visibility flags
    await pool.query("ALTER TABLE ngos ADD COLUMN IF NOT EXISTS email_public BOOLEAN DEFAULT true");
    await pool.query("ALTER TABLE ngos ADD COLUMN IF NOT EXISTS phone_public BOOLEAN DEFAULT true");
    await pool.query("ALTER TABLE ngos ADD COLUMN IF NOT EXISTS address_public BOOLEAN DEFAULT true");
    await pool.query("ALTER TABLE ngos ADD COLUMN IF NOT EXISTS website_public BOOLEAN DEFAULT true");
    await pool.query("ALTER TABLE ngos ADD COLUMN IF NOT EXISTS about_public BOOLEAN DEFAULT true");
    await pool.query("ALTER TABLE ngos ADD COLUMN IF NOT EXISTS operating_locations_public BOOLEAN DEFAULT true");
    await pool.query("ALTER TABLE ngos ADD COLUMN IF NOT EXISTS registration_number_public BOOLEAN DEFAULT false");
    // Project field visibility flags
    await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS description_public BOOLEAN DEFAULT true");
    await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS location_public BOOLEAN DEFAULT true");
    console.log('OK: all privacy flag columns added');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
})();

