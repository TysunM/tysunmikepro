import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { q } from './db.js';

export async function createUser(email, password, name) {
  const hash = await bcrypt.hash(password, 12);
  const res = await q('INSERT INTO users(email,password_hash,name) VALUES($1,$2,$3) RETURNING id', [email, hash, name]);
  return res.rows[0];
}

export async function authenticate(email, password) {
  const res = await q('SELECT * FROM users WHERE email=$1', [email]);
  const user = res.rows[0];
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;
  const token = jwt.sign({ uid: user.id, admin: user.is_admin }, config.jwtSecret, { expiresIn: '7d' });
  return { token, user };
}



