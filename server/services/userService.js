import { initDb } from '../config/database.js';
import bcrypt from 'bcrypt';

export async function createUser({ username, password }) {
  const db = await initDb();
  const hash = bcrypt.hashSync(password, 10);
  const result = await db.run(`INSERT INTO users (username, password_hash) VALUES (?, ?)`, [username, hash]);
  return { id: result.lastID, username };
}

export async function findUserByUsername(username) {
  const db = await initDb();
  return db.get('SELECT * FROM users WHERE username = ?', [username]);
}

export function validatePassword(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}
