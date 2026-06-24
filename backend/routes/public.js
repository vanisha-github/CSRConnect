const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/projects', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT p.*, c.company_name, n.ngo_name,
        COALESCE((SELECT score FROM impact_scores WHERE project_id = p.id ORDER BY generated_at DESC LIMIT 1), 0) as impact_score
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN ngos n ON p.ngo_id = n.id
      WHERE p.status IN ('completed', 'in_progress')
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.get('/ngos', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, ngo_name, registration_number, email, phone, address, trust_score, created_at FROM ngos WHERE verified = 1 ORDER BY trust_score DESC'
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
