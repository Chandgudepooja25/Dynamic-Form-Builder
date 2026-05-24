import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool } from '../config/db';

export interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_at: Date;
  updated_at: Date;
}

/** Public JSON shape (matches prior Mongoose `toJSON`). */
export function userToApi(row: UserRow) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function countUsers(): Promise<number> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS c FROM users'
  );
  return Number((rows[0] as { c: number }).c);
}

export async function findUserByEmail(
  email: string
): Promise<UserRow | null> {
  const pool = getPool();
  const [rows] = await pool.query<UserRow[]>(
    'SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE email = ? LIMIT 1',
    [email.toLowerCase()]
  );
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  if (!/^\d+$/.test(id)) return null;
  const pool = getPool();
  const [rows] = await pool.query<UserRow[]>(
    'SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
}): Promise<UserRow> {
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [input.name, input.email.toLowerCase(), input.passwordHash, input.role]
  );
  const id = String(result.insertId);
  const row = await findUserById(id);
  if (!row) throw new Error('[users] insert succeeded but row not found');
  return row;
}
