const db = require('../config/db');
const { calculateImpactScore, SDG_MAP } = require('../services/impactService');

exports.createProject = async (req, res, next) => {
  try {
    const { title, description, category, budget, location, latitude, longitude, start_date, end_date } = req.body;

    let companyId;
    if (req.user.role === 'company') {
      const company = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
      if (company.rows.length === 0) return res.status(400).json({ error: 'Company profile not found' });
      companyId = company.rows[0].id;
    } else {
      companyId = req.body.company_id;
    }

    if (!title || !category || !budget) {
      return res.status(400).json({ error: 'Title, category, and budget are required' });
    }

    const status = !end_date ? 'active' : 'pending';

    const result = await db.query(
      'INSERT INTO projects (company_id, title, description, category, budget, location, latitude, longitude, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [companyId, title, description, category, budget, location, latitude, longitude, start_date, end_date, status]
    );

    const project = result.rows[0];

    if (category && SDG_MAP[category]) {
      for (const sdg of SDG_MAP[category]) {
        await db.query(
          'INSERT INTO sdg_mapping (project_id, sdg_code) VALUES ($1, $2)',
          [project.id, sdg]
        );
      }
    }

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

exports.getAllProjects = async (req, res, next) => {
  try {
    let query = `
      SELECT p.*, c.company_name, n.ngo_name,
        COALESCE((SELECT score FROM impact_scores WHERE project_id = p.id ORDER BY generated_at DESC LIMIT 1), 0) as impact_score
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN ngos n ON p.ngo_id = n.id
    `;

    const conditions = [];
    const params = [];

    if (req.user.role === 'company') {
      const company = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
      if (company.rows.length > 0) {
        conditions.push('p.company_id = $1');
        params.push(company.rows[0].id);
      }
    } else if (req.user.role === 'ngo') {
      const ngo = await db.query('SELECT id FROM ngos WHERE user_id = $1', [req.user.id]);
      if (ngo.rows.length > 0) {
        conditions.push('p.ngo_id = $1');
        params.push(ngo.rows[0].id);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.company_name, n.ngo_name, n.trust_score as ngo_trust_score,
        COALESCE((SELECT score FROM impact_scores WHERE project_id = p.id ORDER BY generated_at DESC LIMIT 1), 0) as impact_score
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN ngos n ON p.ngo_id = n.id
      WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });

    const project = result.rows[0];

    const sdgs = await db.query('SELECT sdg_code FROM sdg_mapping WHERE project_id = $1', [project.id]);
    project.sdg_tags = sdgs.rows.map(s => s.sdg_code);

    const updates = await db.query(
      'SELECT * FROM project_updates WHERE project_id = $1 ORDER BY created_at DESC',
      [project.id]
    );
    project.updates = updates.rows;

    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, budget, location, latitude, longitude, start_date, end_date, status } = req.body;

    let resolvedEndDate = end_date || null;
    if (status === 'completed' && !end_date) {
      resolvedEndDate = new Date().toISOString().split('T')[0];
    }

    const result = await db.query(
      `UPDATE projects SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        budget = COALESCE($4, budget),
        location = COALESCE($5, location),
        latitude = COALESCE($6, latitude),
        longitude = COALESCE($7, longitude),
        start_date = COALESCE($8, start_date),
        end_date = COALESCE($9, end_date),
        status = COALESCE($10, status)
      WHERE id = $11 RETURNING *`,
      [title, description, category, budget, location, latitude, longitude, start_date, resolvedEndDate, status, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.assignNgo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ngo_id } = req.body;

    const result = await db.query(
      "UPDATE projects SET ngo_id = $1, status = CASE WHEN status = 'pending' THEN 'active' ELSE status END WHERE id = $2 RETURNING *",
      [ngo_id, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
