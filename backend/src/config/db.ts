/**
 * MySQL (e.g. XAMPP MariaDB) connection pool.
 *
 * Configure via `DB_*` env vars in `backend/.env`.
 */

import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) throw new Error('[db] pool not initialized — call connectDB() first');
  return pool;
}

export async function connectDB(): Promise<void> {
  pool = mysql.createPool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'dynamic_form_builder',
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: false,
  });

  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log(
    `[db] connected to MySQL (${process.env.DB_HOST ?? '127.0.0.1'}/${process.env.DB_NAME ?? 'dynamic_form_builder'})`
  );
}
