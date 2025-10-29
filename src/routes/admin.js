import { q } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import express from 'express';
const router = express.Router();

router.get('/projects', requireAuth, requireAdmin, async (req,res) => {
  const r = await q('SELECT * FROM projects ORDER BY updated_at DESC');
  res.json({ projects: r.rows });
});

router.get('/payments', requireAuth, requireAdmin, async (req,res) => {
  const r = await q('SELECT * FROM payments ORDER BY created_at DESC');
  res.json({ payments: r.rows });
});

router.get('/consultations', requireAuth, requireAdmin, async (req,res) => {
  const r = await q('SELECT * FROM consultations ORDER BY start_at DESC');
  res.json({ consultations: r.rows });
});

router.get('/users', requireAuth, requireAdmin, async (req,res) => {
  const r = await q('SELECT id,email,name,avatar_url FROM users ORDER BY created_at DESC');
  res.json({ users: r.rows });
});

router.get('/files', requireAuth, requireAdmin, async (req,res) => {
  const r = await q('SELECT * FROM project_files ORDER BY uploaded_at DESC');
  res.json({ files: r.rows });
});

router.post('/projects/eta-adjust', requireAuth, requireAdmin, async (req,res) => {
  const { ids, deltaDays } = req.body;
  const r = await q(`
    UPDATE projects
    SET eta = eta + INTERVAL '${deltaDays} day',
        updated_at = NOW()
    WHERE id = ANY($1::int[])
    RETURNING id
  `, [ids]);
  res.json({ updated: r.rows.length });
});

router.post('/files/update', requireAuth, requireAdmin, async (req,res) => {
  const { id, status } = req.body;
  await q('UPDATE project_files SET status=$1 WHERE id=$2', [status, id]);
  res.json({ ok: true });
});
export default router;
