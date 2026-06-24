const db = require('../config/db');
const { calculateImpactScore, calculateNgoTrustScore } = require('../services/impactService');

exports.addUpdate = async (req, res, next) => {
  try {
    const { project_id, beneficiaries_reached, budget_utilized, progress_percentage, remarks } = req.body;

    if (!project_id) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const result = await db.query(
      'INSERT INTO project_updates (project_id, beneficiaries_reached, budget_utilized, progress_percentage, remarks) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [project_id, beneficiaries_reached || 0, budget_utilized || 0, progress_percentage || 0, remarks]
    );

    if (parseFloat(progress_percentage) >= 100) {
      await db.query("UPDATE projects SET status = 'completed' WHERE id = $1", [project_id]);
    } else if (parseFloat(progress_percentage) > 0) {
      await db.query("UPDATE projects SET status = 'in_progress' WHERE id = $1", [project_id]);
    }

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

    res.status(201).json(result.rows[0]);
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
    const { beneficiaries_reached, budget_utilized, progress_percentage, remarks } = req.body;

    const result = await db.query(
      'UPDATE project_updates SET beneficiaries_reached = COALESCE($1, beneficiaries_reached), budget_utilized = COALESCE($2, budget_utilized), progress_percentage = COALESCE($3, progress_percentage), remarks = COALESCE($4, remarks) WHERE id = $5 RETURNING *',
      [beneficiaries_reached, budget_utilized, progress_percentage, remarks, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Update not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
