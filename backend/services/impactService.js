const db = require('../config/db');

const IMPACT_WEIGHTS = {
  budgetUtilization: 0.30,
  beneficiariesReached: 0.30,
  progressPercentage: 0.20,
  timeliness: 0.20,
};

const TRUST_WEIGHTS = {
  projectCompletion: 0.40,
  reportingConsistency: 0.30,
  verificationStatus: 0.30,
};

const SDG_MAP = {
  'Education': ['SDG 4'],
  'Healthcare': ['SDG 3'],
  'Women Empowerment': ['SDG 5'],
  'Plantation': ['SDG 13', 'SDG 15'],
  'Skill Development': ['SDG 8'],
};

async function calculateImpactScore(projectId) {
  const project = await db.query(
    'SELECT budget, start_date, end_date, status FROM projects WHERE id = $1',
    [projectId]
  );
  if (project.rows.length === 0) throw new Error('Project not found');

  const updates = await db.query(
    'SELECT beneficiaries_reached, budget_utilized, progress_percentage, created_at FROM project_updates WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1',
    [projectId]
  );

  const p = project.rows[0];
  let score = 0;

  if (updates.rows.length > 0) {
    const u = updates.rows[0];

    const budgetUtil = p.budget > 0 ? (u.budget_utilized / p.budget) : 0;
    score += Math.min(budgetUtil, 1) * IMPACT_WEIGHTS.budgetUtilization * 100;

    const beneScore = Math.min(u.beneficiaries_reached / 1000, 1);
    score += beneScore * IMPACT_WEIGHTS.beneficiariesReached * 100;

    score += (u.progress_percentage / 100) * IMPACT_WEIGHTS.progressPercentage * 100;

    if (p.end_date) {
      const now = new Date();
      const end = new Date(p.end_date);
      const timeliness = now <= end ? 1 : Math.max(0, 1 - (now - end) / (30 * 24 * 60 * 60 * 1000));
      score += timeliness * IMPACT_WEIGHTS.timeliness * 100;
    } else {
      score += IMPACT_WEIGHTS.timeliness * 100;
    }
  }

  score = Math.round(Math.min(score, 100) * 100) / 100;

  await db.query(
    'INSERT INTO impact_scores (project_id, score) VALUES ($1, $2)',
    [projectId, score]
  );

  const projectData = await db.query('SELECT category FROM projects WHERE id = $1', [projectId]);
  const category = projectData.rows[0]?.category;
  if (category && SDG_MAP[category]) {
    for (const sdg of SDG_MAP[category]) {
      const existing = await db.query('SELECT id FROM sdg_mapping WHERE project_id = $1 AND sdg_code = $2', [projectId, sdg]);
      if (existing.rows.length === 0) {
        await db.query('INSERT INTO sdg_mapping (project_id, sdg_code) VALUES ($1, $2)', [projectId, sdg]);
      }
    }
  }

  return score;
}

async function calculateNgoTrustScore(ngoId) {
  const projects = await db.query(
    'SELECT id, status FROM projects WHERE ngo_id = $1',
    [ngoId]
  );

  const ngo = await db.query(
    'SELECT verified FROM ngos WHERE id = $1',
    [ngoId]
  );

  let score = 0;

  if (projects.rows.length > 0) {
    const completed = projects.rows.filter(p => p.status === 'completed').length;
    const completionRate = completed / projects.rows.length;
    score += completionRate * TRUST_WEIGHTS.projectCompletion * 100;

    const updatesCount = await db.query(
      'SELECT COUNT(DISTINCT pu.id) as cnt FROM projects p LEFT JOIN project_updates pu ON p.id = pu.project_id WHERE p.ngo_id = $1',
      [ngoId]
    );
    const totalUpdates = parseInt(updatesCount.rows[0]?.cnt || 0);
    const consistency = Math.min(totalUpdates / (projects.rows.length * 2), 1);
    score += consistency * TRUST_WEIGHTS.reportingConsistency * 100;
  } else {
    score += TRUST_WEIGHTS.projectCompletion * 100;
    score += TRUST_WEIGHTS.reportingConsistency * 100;
  }

  if (ngo.rows.length > 0 && ngo.rows[0].verified) {
    score += TRUST_WEIGHTS.verificationStatus * 100;
  }

  score = Math.round(Math.min(score, 100) * 100) / 100;

  await db.query(
    'UPDATE ngos SET trust_score = $1 WHERE id = $2',
    [score, ngoId]
  );

  return score;
}

module.exports = { calculateImpactScore, calculateNgoTrustScore, SDG_MAP };
