import pg from 'pg';
import { config } from './config.js';
export const pool = new pg.Pool({ connectionString: config.dbUrl });
export const q = (text, params) => pool.query(text, params);
