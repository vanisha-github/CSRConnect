const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  try {
    console.log('Starting database seed...');

    await db.query('TRUNCATE TABLE sdg_mapping, impact_scores, documents, project_updates, projects, ngos, companies, users RESTART IDENTITY CASCADE');

    const hash = await bcrypt.hash('password123', 10);

    const admin = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Admin User', 'admin@csr.com', hash, 'admin']
    );

    const company1 = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Rahul Sharma', 'rahul@tata.com', hash, 'company']
    );
    const comp1 = await db.query(
      'INSERT INTO companies (user_id, company_name, industry, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [company1.rows[0].id, 'Tata Group', 'Conglomerate', 'Leading Indian multinational conglomerate']
    );

    const company2 = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Priya Patel', 'priya@reliance.com', hash, 'company']
    );
    const comp2 = await db.query(
      'INSERT INTO companies (user_id, company_name, industry, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [company2.rows[0].id, 'Reliance Industries', 'Energy & Telecom', 'Indian multinational conglomerate']
    );

    const company3 = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Amit Verma', 'amit@infosys.com', hash, 'company']
    );
    const comp3 = await db.query(
      'INSERT INTO companies (user_id, company_name, industry, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [company3.rows[0].id, 'Infosys', 'IT Services', 'Global leader in digital services']
    );

    const ngo1 = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Meena Devi', 'meena@pratham.org', hash, 'ngo']
    );
    const ng1 = await db.query(
      'INSERT INTO ngos (user_id, ngo_name, registration_number, email, phone, address, verified, trust_score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [ngo1.rows[0].id, 'Pratham Education Foundation', 'NGO-2018-0421', 'info@pratham.org', '+91-11-4222-5000', 'New Delhi, India', 1, 85.50]
    );

    const ngo2 = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Dr. Vikram Joshi', 'vikram@sewa.org', hash, 'ngo']
    );
    const ng2 = await db.query(
      'INSERT INTO ngos (user_id, ngo_name, registration_number, email, phone, address, verified, trust_score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [ngo2.rows[0].id, 'SEWA Rural Health', 'NGO-2019-0788', 'contact@sewa.org', '+91-79-2658-4000', 'Ahmedabad, Gujarat', 1, 78.30]
    );

    const ngo3 = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Sunita Reddy', 'sunita@vanrai.org', hash, 'ngo']
    );
    const ng3 = await db.query(
      'INSERT INTO ngos (user_id, ngo_name, registration_number, email, phone, address, verified, trust_score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [ngo3.rows[0].id, 'Vanrai Foundation', 'NGO-2020-0123', 'hello@vanrai.org', '+91-20-2645-3000', 'Pune, Maharashtra', 1, 72.00]
    );

    const ngo4 = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Arun Kumar', 'arun@nari.org', hash, 'ngo']
    );
    const ng4 = await db.query(
      'INSERT INTO ngos (user_id, ngo_name, registration_number, email, phone, address, verified, trust_score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [ngo4.rows[0].id, 'Nari Shakti Sangathan', 'NGO-2021-0567', 'connect@nari.org', '+91-22-2202-1000', 'Mumbai, Maharashtra', 0, 45.00]
    );

    const ngo5 = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Kavita Singh', 'kavita@skill.org', hash, 'ngo']
    );
    const ng5 = await db.query(
      'INSERT INTO ngos (user_id, ngo_name, registration_number, email, phone, address, verified, trust_score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [ngo5.rows[0].id, 'Skill India Foundation', 'NGO-2022-0890', 'info@skillfoundation.org', '+91-44-2855-2000', 'Chennai, Tamil Nadu', 1, 91.20]
    );

    const p1 = await db.query(
      'INSERT INTO projects (company_id, ngo_id, title, description, category, budget, location, latitude, longitude, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id',
      [comp1.rows[0].id, ng1.rows[0].id, 'Digital Literacy in Rural Schools', 'Providing digital education tools and training to 50 rural schools in Uttar Pradesh', 'Education', 2500000, 'Lucknow, UP', 26.8467, 80.9462, '2024-01-15', '2024-12-15', 'in_progress']
    );

    const p2 = await db.query(
      'INSERT INTO projects (company_id, ngo_id, title, description, category, budget, location, latitude, longitude, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id',
      [comp1.rows[0].id, ng2.rows[0].id, 'Clean Water Initiative', 'Installing water purification systems in 100 villages of Rajasthan', 'Healthcare', 5000000, 'Jaipur, RJ', 26.9124, 75.7873, '2024-02-01', '2024-11-30', 'in_progress']
    );

    const p3 = await db.query(
      'INSERT INTO projects (company_id, ngo_id, title, description, category, budget, location, latitude, longitude, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id',
      [comp2.rows[0].id, ng4.rows[0].id, 'Women Entrepreneurship Program', 'Training 5000 women in small business management and micro-enterprise development', 'Women Empowerment', 3500000, 'Mumbai, MH', 19.0760, 72.8777, '2024-03-01', '2025-02-28', 'active']
    );

    const p4 = await db.query(
      'INSERT INTO projects (company_id, ngo_id, title, description, category, budget, location, latitude, longitude, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id',
      [comp2.rows[0].id, ng3.rows[0].id, 'Green Tomorrow: Massive Plantation Drive', 'Planting 1 million trees across degraded forest land in Madhya Pradesh', 'Plantation', 8000000, 'Bhopal, MP', 23.2599, 77.4126, '2024-04-01', '2025-03-31', 'active']
    );

    const p5 = await db.query(
      'INSERT INTO projects (company_id, ngo_id, title, description, category, budget, location, latitude, longitude, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id',
      [comp3.rows[0].id, ng5.rows[0].id, 'Tech Skills for Youth', 'Providing coding and digital skills training to 10000 underprivileged youth', 'Skill Development', 6000000, 'Bangalore, KA', 12.9716, 77.5946, '2024-01-10', '2024-10-15', 'completed']
    );

    const p6 = await db.query(
      'INSERT INTO projects (company_id, ngo_id, title, description, category, budget, location, latitude, longitude, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id',
      [comp3.rows[0].id, ng1.rows[0].id, 'School Infrastructure Development', 'Building and renovating classrooms in 30 government schools in Bihar', 'Education', 4000000, 'Patna, BR', 25.5941, 85.1376, '2024-05-01', '2025-04-30', 'pending']
    );

    const p7 = await db.query(
      'INSERT INTO projects (company_id, ngo_id, title, description, category, budget, location, latitude, longitude, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id',
      [comp1.rows[0].id, ng5.rows[0].id, 'Sustainable Agriculture Training', 'Training farmers in sustainable agricultural practices across Punjab', 'Skill Development', 3000000, 'Ludhiana, PB', 30.9010, 75.8573, '2024-06-01', '2025-01-31', 'active']
    );

    await db.query(
      'INSERT INTO project_updates (project_id, beneficiaries_reached, budget_utilized, progress_percentage, remarks) VALUES ($1, $2, $3, $4, $5)',
      [p1.rows[0].id, 2500, 1200000, 45, 'Completed digital infrastructure setup in 25 schools. Teacher training in progress.']
    );
    await db.query(
      'INSERT INTO project_updates (project_id, beneficiaries_reached, budget_utilized, progress_percentage, remarks) VALUES ($1, $2, $3, $4, $5)',
      [p1.rows[0].id, 3800, 1800000, 60, 'Expanded to 35 schools. Students showing significant improvement in digital skills.']
    );
    await db.query(
      'INSERT INTO project_updates (project_id, beneficiaries_reached, budget_utilized, progress_percentage, remarks) VALUES ($1, $2, $3, $4, $5)',
      [p2.rows[0].id, 15000, 2500000, 40, 'Installed purification systems in 45 villages.']
    );
    await db.query(
      'INSERT INTO project_updates (project_id, beneficiaries_reached, budget_utilized, progress_percentage, remarks) VALUES ($1, $2, $3, $4, $5)',
      [p5.rows[0].id, 8500, 5500000, 90, 'Training completed for 8500 youth. Placement drive initiated.']
    );
    await db.query(
      'INSERT INTO project_updates (project_id, beneficiaries_reached, budget_utilized, progress_percentage, remarks) VALUES ($1, $2, $3, $4, $5)',
      [p5.rows[0].id, 10000, 5800000, 100, 'All 10000 youth trained. 7500 placed in jobs or higher education. Project completed successfully.']
    );

    const scores = [
      { pid: p1.rows[0].id, sc: 72.5 },
      { pid: p2.rows[0].id, sc: 65.0 },
      { pid: p5.rows[0].id, sc: 88.3 },
      { pid: p7.rows[0].id, sc: 45.0 },
    ];
    for (const s of scores) {
      await db.query('INSERT INTO impact_scores (project_id, score) VALUES ($1, $2)', [s.pid, s.sc]);
    }

    const sdgs = [
      { pid: p1.rows[0].id, code: 'SDG 4' },
      { pid: p2.rows[0].id, code: 'SDG 3' },
      { pid: p3.rows[0].id, code: 'SDG 5' },
      { pid: p4.rows[0].id, code: 'SDG 13' },
      { pid: p4.rows[0].id, code: 'SDG 15' },
      { pid: p5.rows[0].id, code: 'SDG 8' },
      { pid: p6.rows[0].id, code: 'SDG 4' },
      { pid: p7.rows[0].id, code: 'SDG 8' },
    ];
    for (const s of sdgs) {
      await db.query('INSERT INTO sdg_mapping (project_id, sdg_code) VALUES ($1, $2)', [s.pid, s.code]);
    }

    console.log('Seed completed successfully!');
    console.log('');
    console.log('Login Credentials:');
    console.log('─────────────────');
    console.log('Admin:   admin@csr.com / password123');
    console.log('Company: rahul@tata.com / password123');
    console.log('Company: priya@reliance.com / password123');
    console.log('Company: amit@infosys.com / password123');
    console.log('NGO:     meena@pratham.org / password123');
    console.log('NGO:     vikram@sewa.org / password123');
    console.log('NGO:     sunita@vanrai.org / password123');
    console.log('NGO:     arun@nari.org / password123');
    console.log('NGO:     kavita@skill.org / password123');
    console.log('');
    console.log('All passwords: password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
