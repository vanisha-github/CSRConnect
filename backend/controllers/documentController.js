const db = require('../config/db');
const path = require('path');

exports.uploadDocument = async (req, res, next) => {
  try {
    const { project_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await db.query(
      'INSERT INTO documents (project_id, uploaded_by, file_name, file_path) VALUES ($1, $2, $3, $4) RETURNING *',
      [project_id, req.user.id, req.file.originalname, req.file.filename]
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

exports.downloadDocument = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });

    const doc = result.rows[0];
    const filePath = path.join(__dirname, '../uploads', doc.file_path);
    res.download(filePath, doc.file_name);
  } catch (error) {
    next(error);
  }
};
