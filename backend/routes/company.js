const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/register', authenticate, authorize('company'), async (req, res, next) => {
  try {
    const { company_name, industry, description } = req.body;
    if (!company_name) return res.status(400).json({ error: 'Company name is required' });

    const result = await db.query(
      'INSERT INTO companies (user_id, company_name, industry, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, company_name, industry, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, authorize('company'), async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT c.*, u.name, u.email FROM companies c JOIN users u ON c.user_id = u.id WHERE c.user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM companies ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
