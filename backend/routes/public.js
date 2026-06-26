const express = require('express');
const router = express.Router();
const db = require('../config/db');

function sanitizeNgo(ngo) {
  if (!ngo) return ngo;
  if (ngo.email_public === false) delete ngo.email;
  if (ngo.phone_public === false) delete ngo.phone;
  if (ngo.address_public === false) delete ngo.address;
  if (ngo.website_public === false) delete ngo.website;
  if (ngo.about_public === false) delete ngo.about;
  if (ngo.operating_locations_public === false) delete ngo.operating_locations;
  if (ngo.registration_number_public === false) delete ngo.registration_number;
  return ngo;
}

function sanitizeProject(project) {
  if (!project) return project;
  if (!project.public_budget) delete project.budget;
  if (!project.description_public) delete project.description;
  if (!project.location_public) delete project.location;
  return project;
}

router.get('/projects', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT p.*, c.company_name, n.ngo_name, n.profile_image as ngo_logo,
        COALESCE((SELECT score FROM impact_scores WHERE project_id = p.id ORDER BY generated_at DESC LIMIT 1), 0) as impact_score,
        COALESCE((SELECT SUM(beneficiaries_reached) FROM project_updates WHERE project_id = p.id), 0) as beneficiaries_reached
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN ngos n ON p.ngo_id = n.id
      WHERE p.status IN ('completed', 'in_progress')
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows.map(sanitizeProject));
  } catch (error) {
    next(error);
  }
});

router.get('/ngos', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT n.*,
        COALESCE((SELECT COUNT(*) FROM projects WHERE ngo_id = n.id AND status = 'completed'), 0) as completed_projects,
        COALESCE((SELECT COUNT(*) FROM projects WHERE ngo_id = n.id AND status IN ('in_progress', 'pending')), 0) as ongoing_projects,
        COALESCE((SELECT SUM(pu.beneficiaries_reached) FROM projects p JOIN project_updates pu ON p.id = pu.project_id WHERE p.ngo_id = n.id), 0) as total_beneficiaries,
        COALESCE((SELECT json_agg(DISTINCT p.category) FROM projects p WHERE p.ngo_id = n.id AND p.category IS NOT NULL), '[]'::json) as focus_areas_list
      FROM ngos n
      WHERE n.verified = 1
      ORDER BY n.trust_score DESC
    `);
    res.json(result.rows.map(sanitizeNgo));
  } catch (error) {
    next(error);
  }
});

router.get('/ngos/:id', async (req, res, next) => {
  try {
    const ngo = await db.query(`
      SELECT n.*,
        COALESCE((SELECT COUNT(*) FROM projects WHERE ngo_id = n.id), 0) as total_projects,
        COALESCE((SELECT COUNT(*) FROM projects WHERE ngo_id = n.id AND status = 'completed'), 0) as completed_projects,
        COALESCE((SELECT COUNT(*) FROM projects WHERE ngo_id = n.id AND status IN ('in_progress', 'pending')), 0) as ongoing_projects,
        COALESCE((SELECT SUM(pu.beneficiaries_reached) FROM projects p JOIN project_updates pu ON p.id = pu.project_id WHERE p.ngo_id = n.id), 0) as total_beneficiaries
      FROM ngos n
      WHERE n.id = $1 AND n.verified = 1
    `, [req.params.id]);
    if (ngo.rows.length === 0) return res.status(404).json({ error: 'NGO not found' });
    const profile = sanitizeNgo(ngo.rows[0]);

    const sdgs = await db.query(`
      SELECT DISTINCT sm.sdg_code FROM sdg_mapping sm
      JOIN projects p ON sm.project_id = p.id
      WHERE p.ngo_id = $1
    `, [profile.id]);
    profile.sdg_tags = sdgs.rows.map(s => s.sdg_code);

    const focusAreas = await db.query(`
      SELECT DISTINCT p.category FROM projects p WHERE p.ngo_id = $1 AND p.category IS NOT NULL
    `, [profile.id]);
    profile.focus_areas_list = focusAreas.rows.map(r => r.category);

    const gallery = await db.query(
      'SELECT * FROM ngo_gallery WHERE ngo_id = $1 ORDER BY created_at DESC',
      [profile.id]
    );
    profile.gallery = gallery.rows;

    const completed = await db.query(`
      SELECT p.*, c.company_name,
        COALESCE((SELECT score FROM impact_scores WHERE project_id = p.id ORDER BY generated_at DESC LIMIT 1), 0) as impact_score
      FROM projects p LEFT JOIN companies c ON p.company_id = c.id
      WHERE p.ngo_id = $1 AND p.status = 'completed'
    `, [profile.id]);
    profile.completed_projects_list = completed.rows.map(sanitizeProject);

    const ongoing = await db.query(`
      SELECT p.*, c.company_name,
        COALESCE((SELECT score FROM impact_scores WHERE project_id = p.id ORDER BY generated_at DESC LIMIT 1), 0) as impact_score
      FROM projects p LEFT JOIN companies c ON p.company_id = c.id
      WHERE p.ngo_id = $1 AND p.status IN ('in_progress', 'pending')
    `, [profile.id]);
    profile.ongoing_projects_list = ongoing.rows.map(sanitizeProject);

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.get('/gallery', async (req, res, next) => {
  try {
    const covers = await db.query(`
      SELECT p.id as project_id, p.title, 'cover' as type, p.cover_image as file_name, p.cover_image as file_path, p.created_at
      FROM projects p
      WHERE p.status IN ('completed', 'in_progress') AND p.cover_image IS NOT NULL AND p.cover_image != ''
      ORDER BY p.created_at DESC
    `);
    const docImages = await db.query(`
      SELECT p.id as project_id, p.title, 'document' as type, d.file_name, d.file_path, d.created_at
      FROM documents d
      JOIN projects p ON d.project_id = p.id
      WHERE p.status IN ('completed', 'in_progress') AND d.is_public = true
        AND d.file_name ~* '\\.(png|jpg|jpeg|gif|svg|webp)$'
      ORDER BY d.created_at DESC
    `);
    const all = [...covers.rows, ...docImages.rows];
    all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(all);
  } catch (error) {
    next(error);
  }
});

router.get('/projects/:id', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT p.*, c.company_name, n.ngo_name, n.profile_image as ngo_logo,
        COALESCE((SELECT score FROM impact_scores WHERE project_id = p.id ORDER BY generated_at DESC LIMIT 1), 0) as impact_score,
        COALESCE((SELECT SUM(beneficiaries_reached) FROM project_updates WHERE project_id = p.id), 0) as beneficiaries_reached
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN ngos n ON p.ngo_id = n.id
      WHERE p.id = $1 AND p.status IN ('completed', 'in_progress')
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const project = sanitizeProject(result.rows[0]);

    const sdgs = await db.query('SELECT sdg_code FROM sdg_mapping WHERE project_id = $1', [project.id]);
    project.sdg_tags = sdgs.rows.map(s => s.sdg_code);

    const updates = await db.query(
      "SELECT * FROM project_updates WHERE project_id = $1 AND is_public = true ORDER BY created_at ASC",
      [project.id]
    );
    project.updates = updates.rows;

    const docs = await db.query(
      `SELECT d.*, u.name as uploaded_by_name FROM documents d
       JOIN users u ON d.uploaded_by = u.id
       WHERE d.project_id = $1 AND d.is_public = true ORDER BY d.created_at DESC`,
      [project.id]
    );
    project.documents = docs.rows;
    project.gallery_images = docs.rows.filter(d => /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(d.file_name));

    res.json(project);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
