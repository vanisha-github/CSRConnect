const db = require('../config/db');

exports.getAdminStats = async (req, res, next) => {
  try {
    const companies = await db.query('SELECT COUNT(*) as count FROM companies');
    const ngos = await db.query('SELECT COUNT(*) as count FROM ngos');
    const projects = await db.query('SELECT COUNT(*) as count FROM projects');
    const budget = await db.query('SELECT COALESCE(SUM(budget), 0) as total FROM projects');
    const active = await db.query("SELECT COUNT(*) as count FROM projects WHERE status IN ('active', 'in_progress')");
    const completed = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'completed'");
    const verifiedNgos = await db.query('SELECT COUNT(*) as count FROM ngos WHERE verified = 1');
    const totalBeneficiaries = await db.query('SELECT COALESCE(SUM(beneficiaries_reached), 0) as total FROM project_updates');

    const categoryStats = await db.query('SELECT category, COUNT(*) as count FROM projects GROUP BY category');
    const statusStats = await db.query('SELECT status, COUNT(*) as count FROM projects GROUP BY status');

    res.json({
      total_companies: parseInt(companies.rows[0].count),
      total_ngos: parseInt(ngos.rows[0].count),
      total_projects: parseInt(projects.rows[0].count),
      total_budget: parseFloat(budget.rows[0].total),
      active_projects: parseInt(active.rows[0].count),
      completed_projects: parseInt(completed.rows[0].count),
      verified_ngos: parseInt(verifiedNgos.rows[0].count),
      total_beneficiaries: parseInt(totalBeneficiaries.rows[0].total),
      category_stats: categoryStats.rows,
      status_stats: statusStats.rows,
    });
  } catch (error) {
    next(error);
  }
};

exports.getNgoPerformance = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT n.id, n.ngo_name, n.trust_score, n.verified,
        COALESCE(p_stats.total_projects, 0) as total_projects,
        COALESCE(p_stats.completed_projects, 0) as completed_projects,
        COALESCE(p_stats.total_budget, 0) as total_budget,
        COALESCE(pu_stats.total_beneficiaries, 0) as total_beneficiaries
      FROM ngos n
      LEFT JOIN (
        SELECT ngo_id,
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
          SUM(budget) as total_budget
        FROM projects
        GROUP BY ngo_id
      ) p_stats ON n.id = p_stats.ngo_id
      LEFT JOIN (
        SELECT p.ngo_id,
          SUM(pu.beneficiaries_reached) as total_beneficiaries
        FROM project_updates pu
        JOIN projects p ON pu.project_id = p.id
        GROUP BY p.ngo_id
      ) pu_stats ON n.id = pu_stats.ngo_id
      ORDER BY n.trust_score DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyStats = async (req, res, next) => {
  try {
    const company = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
    if (company.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    const companyId = company.rows[0].id;

    const projects = await db.query('SELECT COUNT(*) as count FROM projects WHERE company_id = $1', [companyId]);
    const budget = await db.query("SELECT COALESCE(SUM(budget), 0) as total, COALESCE(SUM(CASE WHEN status = 'completed' THEN budget END), 0) as used FROM projects WHERE company_id = $1", [companyId]);
    const active = await db.query("SELECT COUNT(*) as count FROM projects WHERE company_id = $1 AND status IN ('active', 'in_progress')", [companyId]);
    const completed = await db.query("SELECT COUNT(*) as count FROM projects WHERE company_id = $1 AND status = 'completed'", [companyId]);
    const beneficiaries = await db.query('SELECT COALESCE(SUM(pu.beneficiaries_reached), 0) as total FROM projects p LEFT JOIN project_updates pu ON p.id = pu.project_id WHERE p.company_id = $1', [companyId]);

    const categoryStats = await db.query('SELECT category, COUNT(*) as count FROM projects WHERE company_id = $1 GROUP BY category', [companyId]);
    const monthlyBudget = await db.query("SELECT TO_CHAR(p.created_at, 'YYYY-MM') as month, SUM(p.budget) as budget FROM projects p WHERE p.company_id = $1 GROUP BY month ORDER BY month", [companyId]);

    res.json({
      total_projects: parseInt(projects.rows[0].count),
      total_budget: parseFloat(budget.rows[0].total),
      budget_utilized: parseFloat(budget.rows[0].used),
      active_projects: parseInt(active.rows[0].count),
      completed_projects: parseInt(completed.rows[0].count),
      total_beneficiaries: parseInt(beneficiaries.rows[0].total),
      category_stats: categoryStats.rows,
      monthly_budget: monthlyBudget.rows,
    });
  } catch (error) {
    next(error);
  }
};

exports.getNgoStats = async (req, res, next) => {
  try {
    const ngo = await db.query('SELECT id FROM ngos WHERE user_id = $1', [req.user.id]);
    if (ngo.rows.length === 0) return res.status(404).json({ error: 'NGO not found' });
    const ngoId = ngo.rows[0].id;

    const assigned = await db.query('SELECT COUNT(*) as count FROM projects WHERE ngo_id = $1', [ngoId]);
    const pending = await db.query("SELECT COUNT(*) as count FROM projects WHERE ngo_id = $1 AND status = 'active'", [ngoId]);
    const reports = await db.query('SELECT COUNT(*) as count FROM documents d JOIN projects p ON d.project_id = p.id WHERE p.ngo_id = $1', [ngoId]);
    const beneficiaries = await db.query('SELECT COALESCE(SUM(pu.beneficiaries_reached), 0) as total FROM projects p LEFT JOIN project_updates pu ON p.id = pu.project_id WHERE p.ngo_id = $1', [ngoId]);
    const totalBudget = await db.query('SELECT COALESCE(SUM(budget), 0) as total FROM projects WHERE ngo_id = $1', [ngoId]);

    res.json({
      assigned_projects: parseInt(assigned.rows[0].count),
      pending_updates: parseInt(pending.rows[0].count),
      submitted_reports: parseInt(reports.rows[0].count),
      total_beneficiaries: parseInt(beneficiaries.rows[0].total),
      total_budget: parseFloat(totalBudget.rows[0].total),
    });
  } catch (error) {
    next(error);
  }
};

exports.getPublicStats = async (req, res, next) => {
  try {
    const projects = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'completed'");
    const ngos = await db.query('SELECT COUNT(*) as count FROM ngos WHERE verified = 1');
    const budget = await db.query('SELECT COALESCE(SUM(budget), 0) as total FROM projects');
    const beneficiaries = await db.query('SELECT COALESCE(SUM(beneficiaries_reached), 0) as total FROM project_updates');
    const sdgCoverage = await db.query('SELECT sdg_code, COUNT(*) as count FROM sdg_mapping GROUP BY sdg_code ORDER BY count DESC');
    const categoryStats = await db.query("SELECT category, COUNT(*) as count FROM projects WHERE status = 'completed' GROUP BY category");

    res.json({
      total_verified_projects: parseInt(projects.rows[0].count),
      total_verified_ngos: parseInt(ngos.rows[0].count),
      total_csr_budget: parseFloat(budget.rows[0].total),
      total_beneficiaries: parseInt(beneficiaries.rows[0].total),
      sdg_coverage: sdgCoverage.rows,
      category_stats: categoryStats.rows,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMapData = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT p.id, p.title, p.category, p.budget, p.location, p.latitude, p.longitude, p.status,
        COALESCE((SELECT beneficiaries_reached FROM project_updates WHERE project_id = p.id ORDER BY created_at DESC LIMIT 1), 0) as beneficiaries,
        c.company_name,
        n.ngo_name,
        COALESCE((SELECT score FROM impact_scores WHERE project_id = p.id ORDER BY generated_at DESC LIMIT 1), 0) as impact_score
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN ngos n ON p.ngo_id = n.id
      WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getEsgMetrics = async (req, res, next) => {
  try {
    const trees = await db.query("SELECT COALESCE(SUM(beneficiaries_reached), 0) as trees FROM project_updates pu JOIN projects p ON pu.project_id = p.id WHERE p.category = 'Plantation'");
    const water = await db.query("SELECT COALESCE(SUM(beneficiaries_reached), 0) as water FROM project_updates pu JOIN projects p ON pu.project_id = p.id WHERE p.category = 'Healthcare'");

    const students = await db.query("SELECT COALESCE(SUM(beneficiaries_reached), 0) as students FROM project_updates pu JOIN projects p ON pu.project_id = p.id WHERE p.category = 'Education'");
    const women = await db.query("SELECT COALESCE(SUM(beneficiaries_reached), 0) as women FROM project_updates pu JOIN projects p ON pu.project_id = p.id WHERE p.category = 'Women Empowerment'");
    const beneficiaries = await db.query('SELECT COALESCE(SUM(beneficiaries_reached), 0) as total FROM project_updates');

    const verifiedNgos = await db.query('SELECT COUNT(*) as count FROM ngos WHERE verified = 1');
    const reports = await db.query('SELECT COUNT(*) as count FROM documents');

    const topImpact = await db.query(`
      SELECT p.title, n.ngo_name, i.score, p.category
      FROM impact_scores i
      JOIN projects p ON i.project_id = p.id
      LEFT JOIN ngos n ON p.ngo_id = n.id
      ORDER BY i.score DESC LIMIT 5
    `);

    res.json({
      environmental: {
        trees_planted: parseInt(trees.rows[0].trees),
        water_conserved: parseInt(water.rows[0].water),
      },
      social: {
        students_educated: parseInt(students.rows[0].students),
        women_empowered: parseInt(women.rows[0].women),
        beneficiaries_reached: parseInt(beneficiaries.rows[0].total),
      },
      governance: {
        verified_ngos: parseInt(verifiedNgos.rows[0].count),
        reports_uploaded: parseInt(reports.rows[0].count),
      },
      top_impact_projects: topImpact.rows,
    });
  } catch (error) {
    next(error);
  }
};
