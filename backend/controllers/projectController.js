const db = require('../config/db');
const { calculateImpactScore, SDG_MAP } = require('../services/impactService');

exports.createProject = async (req, res, next) => {
  try {
    const { title, description, category, budget, location, latitude, longitude, start_date, end_date, cover_image, objectives, public_budget, description_public, location_public, esg_pillar } = req.body;

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

    const status = 'pending';

    const result = await db.query(
      'INSERT INTO projects (company_id, title, description, category, budget, location, latitude, longitude, start_date, end_date, status, cover_image, objectives, public_budget, description_public, location_public, esg_pillar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *',
      [companyId, title, description, category, budget, location, latitude, longitude, start_date, end_date, status, cover_image, objectives, public_budget !== false,
        description_public !== false, location_public !== false, esg_pillar]
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
    const { title, description, category, budget, location, latitude, longitude, start_date, end_date, status, cover_image, objectives, public_budget, description_public, location_public, esg_pillar } = req.body;

    const current = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const existing = current.rows[0];

    const newStatus = status || existing.status;
    const today = new Date().toISOString().split('T')[0];

    let newEndDate = existing.end_date;
    if (end_date !== undefined && end_date !== '') {
      newEndDate = end_date;
    } else if (status === 'pending') {
      newEndDate = null;
    } else if (status === 'completed') {
      newEndDate = existing.end_date;
    } else if (status === 'cancelled' && !existing.actual_end_date) {
      newEndDate = existing.end_date;
    }

    let actualEndDate = existing.actual_end_date;
    if (status === 'completed') {
      actualEndDate = today;
    } else if (status === 'pending' || status === 'in_progress' || status === 'cancelled') {
      actualEndDate = null;
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
        end_date = $9,
        status = $10,
        actual_end_date = $11,
        cover_image = COALESCE($12, cover_image),
        objectives = COALESCE($13, objectives),
        public_budget = COALESCE($14, public_budget),
        description_public = COALESCE($15, description_public),
        location_public = COALESCE($16, location_public),
        esg_pillar = COALESCE($17, esg_pillar)
      WHERE id = $18 RETURNING *`,
      [title || existing.title, description || existing.description, category || existing.category,
       budget || existing.budget, location || existing.location, latitude || existing.latitude,
       longitude || existing.longitude, start_date || existing.start_date,
       newEndDate, newStatus, actualEndDate,
       cover_image || existing.cover_image, objectives || existing.objectives,
       public_budget !== undefined ? public_budget : existing.public_budget,
       description_public !== undefined ? description_public : existing.description_public,
       location_public !== undefined ? location_public : existing.location_public,
       esg_pillar || existing.esg_pillar,
       id]
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

exports.uploadCoverImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { id } = req.params;
    const result = await db.query(
      'UPDATE projects SET cover_image = $1 WHERE id = $2 RETURNING *',
      [req.file.path, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.removeCoverImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'UPDATE projects SET cover_image = NULL WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.assignNgo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ngo_id } = req.body;

    const result = await db.query(
      'UPDATE projects SET ngo_id = $1 WHERE id = $2 RETURNING *',
      [ngo_id, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.verifyProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    const result = await db.query(
      'UPDATE projects SET verified = $1 WHERE id = $2 RETURNING *',
      [verified, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
