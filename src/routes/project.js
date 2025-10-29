import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { q } from '../db.js';
import { calcETA } from '../utils/dates.js';
import { sendMail } from '../mail.js';
import { isValidPackage, isValidSize, isValidStatus, sanitizeInput } from '../utils/validation.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const { title, package: pkg, size } = req.body;
  
  // Validate input
  if (!title || !pkg) {
    return res.status(400).json({ error: 'Title and package are required' });
  }
  
  if (!isValidPackage(pkg)) {
    return res.status(400).json({ error: 'Invalid package type' });
  }
  
  const projectSize = size || 'normal';
  if (!isValidSize(projectSize)) {
    return res.status(400).json({ error: 'Invalid project size' });
  }
  
  const sanitizedTitle = sanitizeInput(title);
  const now = new Date();
  const eta = calcETA(now, pkg, size);
  const r = await q(
    'INSERT INTO projects(user_id,title,package,status,eta,size) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
    [req.user.uid, sanitizedTitle, pkg, 'intake', eta, projectSize]
  );
  res.json(r.rows[0]);
});

router.get('/', requireAuth, async (req, res) => {
  const projects = await q('SELECT * FROM projects WHERE user_id=$1 ORDER BY created_at DESC', [req.user.uid]);
  res.json(projects.rows);
});

router.post('/:id/advance', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { nextStatus, etaHours } = req.body;
  
  // Validate status
  if (!nextStatus || !isValidStatus(nextStatus)) {
    return res.status(400).json({ error: 'Invalid status' });
  } // e.g., mixing -> mastering, 12 hours ETA
  const p = await q('UPDATE projects SET status=$1, updated_at=NOW() WHERE id=$2 AND user_id=$3 RETURNING *', [nextStatus, id, req.user.uid]);
  const proj = p.rows[0];
  if (!proj) return res.status(404).json({ error: 'Not found' });

  // Auto email notifications on key state changes
  const u = await q('SELECT email FROM users WHERE id=$1', [req.user.uid]);
  const email = u.rows[0]?.email;

  if (nextStatus === 'mastering') {
    await sendMail(email, `Mix complete: ${proj.title}`, `
      <p>Tysun has finished the mixing stage and is moving on to mastering.</p>
      <p>Estimated time: ${etaHours || 12} hours.</p>
    `);
  }
  if (nextStatus === 'delivered') {
    await sendMail(email, `Delivered: ${proj.title}`, `<p>Your project has been delivered. Enjoy!</p>`);
  }

  res.json(proj);
});

export default router;
