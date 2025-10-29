import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { recordReferral, isEligibleForFreeMaster } from '../utils/referrals.js';
import { q } from '../db.js';
const router = express.Router();

// Client submits a referral
router.post('/', requireAuth, async (req, res) => {
  const { referredEmail } = req.body;
  const id = await recordReferral(req.user.uid, referredEmail);
  res.json({ ok: true, referralId: id });
});

// Admin marks referred user's completions (tie to system events in future)
router.post('/:id/referred-completed', async (req, res) => {
  const { id } = req.params;
  const { count } = req.body;
  await q('UPDATE referral_activity SET referred_projects_completed=$1, last_project_completed_at=NOW() WHERE referral_id=$2', [count, id]);
  res.json({ ok: true });
});

// Check eligibility
router.get('/eligibility', requireAuth, async (req, res) => {
  const eligible = await isEligibleForFreeMaster(req.user.uid);
  res.json({ eligible });
});

export default router;
