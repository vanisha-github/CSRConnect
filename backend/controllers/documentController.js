const db = require('../config/db');
const path = require('path');

exports.uploadDocument = async (req, res, next) => {
  try {
    const { project_id, is_public } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await db.query(
      'INSERT INTO documents (project_id, uploaded_by, file_name, file_path, is_public, reviewed) VALUES ($1, $2, $3, $4, $5, false) RETURNING *',
      [project_id, req.user.id, req.file.originalname, req.file.path, is_public !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getDocuments = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT d.*, u.name as uploaded_by_name FROM documents d JOIN users u ON d.uploaded_by = u.id WHERE d.project_id = $1 ORDER BY d.created_at DESC',
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM documents WHERE id = $1', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getMyGallery = async (req, res, next) => {
  try {
    let projectIds;
    if (req.user.role === 'ngo') {
      const ngo = await db.query('SELECT id FROM ngos WHERE user_id = $1', [req.user.id]);
      if (ngo.rows.length === 0) return res.json([]);
      const projects = await db.query('SELECT id FROM projects WHERE ngo_id = $1', [ngo.rows[0].id]);
      projectIds = projects.rows.map(p => p.id);
    } else if (req.user.role === 'company') {
      const company = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
      if (company.rows.length === 0) return res.json([]);
      const projects = await db.query('SELECT id FROM projects WHERE company_id = $1', [company.rows[0].id]);
      projectIds = projects.rows.map(p => p.id);
    } else {
      return res.json([]);
    }

    if (projectIds.length === 0) return res.json([]);

    const result = await db.query(
      `SELECT d.*, u.name as uploaded_by_name, p.title as project_title
       FROM documents d
       JOIN users u ON d.uploaded_by = u.id
       JOIN projects p ON d.project_id = p.id
       WHERE d.project_id = ANY($1::int[])
         AND (d.file_name ~* '\\.(png|jpg|jpeg|gif|svg|webp)$')
       ORDER BY d.created_at DESC
       LIMIT 50`,
      [projectIds]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.toggleVisibility = async (req, res, next) => {
  try {
    const { is_public } = req.body;
    const doc = await db.query('SELECT reviewed FROM documents WHERE id = $1', [req.params.id]);
    if (doc.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    if (!doc.rows[0].reviewed) return res.status(403).json({ error: 'Must be reviewed before changing visibility' });
    const result = await db.query(
      'UPDATE documents SET is_public = $1 WHERE id = $2 RETURNING *',
      [is_public, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.reviewDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewed, comment } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;
    if (reviewed !== undefined) {
      updates.push(`reviewed = $${idx++}`);
      values.push(reviewed);
    }
    if (comment !== undefined) {
      updates.push(`company_comment = $${idx++}`);
      values.push(comment);
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields provided' });
    values.push(id);
    const result = await db.query(
      `UPDATE documents SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.downloadDocument = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });

    const doc = result.rows[0];
    res.redirect(doc.file_path);
  } catch (error) {
    next(error);
  }
};
