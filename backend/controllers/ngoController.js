const db = require('../config/db');

exports.registerNgo = async (req, res, next) => {
  try {
    const { ngo_name, registration_number, email, phone, address } = req.body;
    const user_id = req.user.id;

    if (!ngo_name || !registration_number) {
      return res.status(400).json({ error: 'NGO name and registration number are required' });
    }

    const result = await db.query(
      'INSERT INTO ngos (user_id, ngo_name, registration_number, email, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, ngo_name, registration_number, email || req.user.email, phone, address]
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
    const result = await db.query('SELECT * FROM ngos WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'NGO not found' });
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

exports.updateNgo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ngo_name, registration_number, phone, address } = req.body;
    const result = await db.query(
      'UPDATE ngos SET ngo_name = COALESCE($1, ngo_name), registration_number = COALESCE($2, registration_number), phone = COALESCE($3, phone), address = COALESCE($4, address) WHERE id = $5 RETURNING *',
      [ngo_name, registration_number, phone, address, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'NGO not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
