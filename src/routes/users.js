import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { q } from '../db.js';
const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  const user = await q('SELECT id,email,name,avatar_url FROM users WHERE id=$1', [req.user.uid]);
  const payments = await q('SELECT * FROM payments WHERE user_id=$1 ORDER BY created_at DESC', [req.user.uid]);
  const consultations = await q('SELECT * FROM consultations WHERE user_id=$1 ORDER BY start_at DESC', [req.user.uid]);
  const loyalty = await q('SELECT * FROM loyalty WHERE user_id=$1', [req.user.uid]);
  res.json({
    user: user.rows[0],
    payments: payments.rows,
    consultations: consultations.rows,
    loyalty: loyalty.rows[0] || { mixes_completed: 0 }
  });
});

export default router;
