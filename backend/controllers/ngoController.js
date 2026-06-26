const db = require('../config/db');

exports.registerNgo = async (req, res, next) => {
  try {
    const { ngo_name, registration_number, email, phone, address, about, website, operating_locations, focus_areas, years_of_experience,
      email_public, phone_public, address_public, website_public, about_public, operating_locations_public, registration_number_public } = req.body;
    const user_id = req.user.id;

    if (!ngo_name || !registration_number) {
      return res.status(400).json({ error: 'NGO name and registration number are required' });
    }

    const result = await db.query(
      'INSERT INTO ngos (user_id, ngo_name, registration_number, email, phone, address, about, website, operating_locations, focus_areas, years_of_experience, email_public, phone_public, address_public, website_public, about_public, operating_locations_public, registration_number_public) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *',
      [user_id, ngo_name, registration_number, email || req.user.email, phone, address, about, website, operating_locations, focus_areas, years_of_experience || 0,
        email_public !== false, phone_public !== false, address_public !== false, website_public !== false, about_public !== false, operating_locations_public !== false, registration_number_public === true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getAllNgos = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT n.*, u.name, u.email as user_email FROM ngos n JOIN users u ON n.user_id = u.id ORDER BY n.created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getNgoById = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT n.*, u.name, u.email as user_email FROM ngos n JOIN users u ON n.user_id = u.id WHERE n.id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'NGO not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getMyNgo = async (req, res, next) => {
  try {
    let result = await db.query('SELECT * FROM ngos WHERE user_id = $1', [req.user.id]);

    if (result.rows.length === 0) {
      result = await db.query(
        'INSERT INTO ngos (user_id, ngo_name) VALUES ($1, $2) RETURNING *',
        [req.user.id, req.user.name]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.verifyNgo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'UPDATE ngos SET verified = 1 WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'NGO not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.rejectNgo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'UPDATE ngos SET verified = 0 WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'NGO not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const result = await db.query(
      'UPDATE ngos SET profile_image = $1 WHERE user_id = $2 RETURNING *',
      [req.file.path, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'NGO not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.removeProfileImage = async (req, res, next) => {
  try {
    const result = await db.query(
      'UPDATE ngos SET profile_image = NULL WHERE user_id = $1 RETURNING *',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'NGO not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateNgo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ngo_name, registration_number, email, phone, address, about, website, operating_locations, focus_areas, years_of_experience,
      email_public, phone_public, address_public, website_public, about_public, operating_locations_public, registration_number_public } = req.body;
    const exp = years_of_experience === '' ? null : years_of_experience;
    const result = await db.query(
      `UPDATE ngos SET
        ngo_name = COALESCE($1, ngo_name),
        registration_number = COALESCE($2, registration_number),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        address = COALESCE($5, address),
        about = COALESCE($6, about),
        website = COALESCE($7, website),
        operating_locations = COALESCE($8, operating_locations),
        focus_areas = COALESCE($9, focus_areas),
        years_of_experience = COALESCE($10::int, years_of_experience),
        email_public = COALESCE($11, email_public),
        phone_public = COALESCE($12, phone_public),
        address_public = COALESCE($13, address_public),
        website_public = COALESCE($14, website_public),
        about_public = COALESCE($15, about_public),
        operating_locations_public = COALESCE($16, operating_locations_public),
        registration_number_public = COALESCE($17, registration_number_public)
      WHERE id = $18 RETURNING *`,
      [ngo_name, registration_number, email, phone, address, about, website, operating_locations, focus_areas, exp,
        email_public, phone_public, address_public, website_public, about_public, operating_locations_public, registration_number_public, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'NGO not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getGallery = async (req, res, next) => {
  try {
    const ngo = await db.query('SELECT id FROM ngos WHERE user_id = $1', [req.user.id]);
    if (ngo.rows.length === 0) return res.json([]);
    const result = await db.query(
      'SELECT * FROM ngo_gallery WHERE ngo_id = $1 ORDER BY created_at DESC',
      [ngo.rows[0].id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.uploadGalleryImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const ngo = await db.query('SELECT id FROM ngos WHERE user_id = $1', [req.user.id]);
    if (ngo.rows.length === 0) return res.status(404).json({ error: 'NGO not found' });
    const result = await db.query(
      'INSERT INTO ngo_gallery (ngo_id, file_name, file_path) VALUES ($1, $2, $3) RETURNING *',
      [ngo.rows[0].id, req.file.originalname, req.file.path]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteGalleryImage = async (req, res, next) => {
  try {
    const ngo = await db.query('SELECT id FROM ngos WHERE user_id = $1', [req.user.id]);
    if (ngo.rows.length === 0) return res.status(404).json({ error: 'NGO not found' });
    const result = await db.query(
      'DELETE FROM ngo_gallery WHERE id = $1 AND ngo_id = $2 RETURNING *',
      [req.params.id, ngo.rows[0].id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Image not found' });
    res.json({ message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
};
