const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

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
    let result = await db.query(
      'SELECT c.*, u.name, u.email FROM companies c JOIN users u ON c.user_id = u.id WHERE c.user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      result = await db.query(
        'INSERT INTO companies (user_id, company_name) VALUES ($1, $2) RETURNING *',
        [req.user.id, req.user.name]
      );
    }

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

router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { company_name, industry, description } = req.body;
    const result = await db.query(
      'UPDATE companies SET company_name = COALESCE($1, company_name), industry = COALESCE($2, industry), description = COALESCE($3, description) WHERE id = $4 RETURNING *',
      [company_name, industry, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/profile-image', authenticate, authorize('company'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const result = await db.query(
      'UPDATE companies SET profile_image = $1 WHERE user_id = $2 RETURNING *',
      [req.file.path, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/profile-image', authenticate, authorize('company'), async (req, res, next) => {
  try {
    const result = await db.query(
      'UPDATE companies SET profile_image = NULL WHERE user_id = $1 RETURNING *',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/gallery', authenticate, authorize('company'), async (req, res, next) => {
  try {
    const company = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
    if (company.rows.length === 0) return res.json([]);
    const result = await db.query(
      'SELECT * FROM company_gallery WHERE company_id = $1 ORDER BY created_at DESC',
      [company.rows[0].id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/gallery', authenticate, authorize('company'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const company = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
    if (company.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    const result = await db.query(
      'INSERT INTO company_gallery (company_id, file_name, file_path) VALUES ($1, $2, $3) RETURNING *',
      [company.rows[0].id, req.file.originalname, req.file.path]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/gallery/:id', authenticate, authorize('company'), async (req, res, next) => {
  try {
    const company = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
    if (company.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    const result = await db.query(
      'DELETE FROM company_gallery WHERE id = $1 AND company_id = $2 RETURNING *',
      [req.params.id, company.rows[0].id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Image not found' });
    res.json({ message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
