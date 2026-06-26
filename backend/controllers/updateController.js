const db = require('../config/db');
const path = require('path');
const { calculateImpactScore, calculateNgoTrustScore } = require('../services/impactService');

exports.addUpdate = async (req, res, next) => {
  try {
    const { project_id, beneficiaries_reached, budget_utilized, progress_percentage, remarks, is_public } = req.body;
    const file_name = req.file ? req.file.originalname : null;
    const file_path = req.file ? req.file.path : null;

    if (!project_id) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const result = await db.query(
      'INSERT INTO project_updates (project_id, beneficiaries_reached, budget_utilized, progress_percentage, remarks, file_name, file_path, is_public, reviewed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false) RETURNING *',
      [project_id, beneficiaries_reached || 0, budget_utilized || 0, progress_percentage || 0, remarks, file_name, file_path, is_public !== false]
    );

    try {
      await calculateImpactScore(project_id);
    } catch (e) {
      console.error('Impact score calculation error:', e.message);
    }

    try {
      const project = await db.query('SELECT ngo_id FROM projects WHERE id = $1', [project_id]);
      if (project.rows.length > 0 && project.rows[0].ngo_id) {
        await calculateNgoTrustScore(project.rows[0].ngo_id);
      }
    } catch (e) {
      console.error('Trust score calculation error:', e.message);
    }

    await db.query("UPDATE projects SET status = 'in_progress' WHERE id = $1 AND status = 'pending'", [project_id]);

    const updatedProject = await db.query('SELECT status FROM projects WHERE id = $1', [project_id]);
    const response = { ...result.rows[0], project_status: updatedProject.rows[0]?.status };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

exports.getUpdates = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM project_updates WHERE project_id = $1 ORDER BY created_at DESC',
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.updateUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { beneficiaries_reached, budget_utilized, progress_percentage, remarks, is_public, remove_file } = req.body;
    const file_name = req.file ? req.file.originalname : null;
    const file_path = req.file ? req.file.path : null;

    const ben = beneficiaries_reached !== '' && beneficiaries_reached !== undefined ? beneficiaries_reached : null;
    const bud = budget_utilized !== '' && budget_utilized !== undefined ? budget_utilized : null;
    const prog = progress_percentage !== '' && progress_percentage !== undefined ? progress_percentage : null;
    const rm = remove_file === true || remove_file === 'true';

    const result = await db.query(
      `UPDATE project_updates SET
        beneficiaries_reached = COALESCE($1::int, beneficiaries_reached),
        budget_utilized = COALESCE($2::numeric, budget_utilized),
        progress_percentage = COALESCE($3::numeric, progress_percentage),
        remarks = COALESCE($4, remarks),
        file_name = CASE WHEN $5 THEN NULL::text ELSE COALESCE($6::text, file_name) END,
        file_path = CASE WHEN $5 THEN NULL::text ELSE COALESCE($7::text, file_path) END,
        is_public = COALESCE($8, is_public),
        reviewed = false,
        company_comment = NULL
      WHERE id = $9 RETURNING *`,
      [ben, bud, prog, remarks, rm, file_name, file_path, is_public, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Update not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.toggleVisibility = async (req, res, next) => {
  try {
    const { is_public } = req.body;
    const update = await db.query('SELECT reviewed FROM project_updates WHERE id = $1', [req.params.id]);
    if (update.rows.length === 0) return res.status(404).json({ error: 'Update not found' });
    if (!update.rows[0].reviewed) return res.status(403).json({ error: 'Must be reviewed before changing visibility' });
    const result = await db.query(
      'UPDATE project_updates SET is_public = $1 WHERE id = $2 RETURNING *',
      [is_public, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.reviewUpdate = async (req, res, next) => {
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
      `UPDATE project_updates SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Update not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM project_updates WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Update not found' });
    res.json({ message: 'Update deleted' });
  } catch (error) {
    next(error);
  }
};
