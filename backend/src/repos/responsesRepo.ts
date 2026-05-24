import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import type { Answer, FormResponse } from '../../../shared/types';
import { getPool } from '../config/db';

export interface ResponseRow extends RowDataPacket {
  id: number;
  form_id: number;
  respondent_user_id: number | null;
  session_id: string | null;
  respondent_name: string | null;
  respondent_email: string | null;
  answers: unknown;
  status: 'draft' | 'submitted';
  submitted_at: Date | null;
  created_at: Date;
  updated_at: Date;
  /** From JOIN */
  user_name?: string | null;
  user_email?: string | null;
}

function parseAnswers(raw: unknown): Answer[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw as Answer[];
  if (typeof raw === 'string') {
    try {
      const v = JSON.parse(raw) as unknown;
      return Array.isArray(v) ? (v as Answer[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function responseToApi(row: ResponseRow): FormResponse & {
  createdAt: string;
  updatedAt: string;
} {
  const answers = parseAnswers(row.answers);
  return {
    id: String(row.id),
    formId: String(row.form_id),
    respondent: {
      userId:
        row.respondent_user_id != null
          ? String(row.respondent_user_id)
          : undefined,
      sessionId: row.session_id ?? undefined,
      name: row.respondent_name ?? undefined,
      email: row.respondent_email ?? undefined,
    },
    answers,
    status: row.status,
    submittedAt: row.submitted_at
      ? row.submitted_at.toISOString()
      : undefined,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function findDraft(
  formId: string,
  opts: { userId?: string; sessionId?: string | null }
): Promise<ResponseRow | null> {
  if (!/^\d+$/.test(formId)) return null;
  const pool = getPool();
  if (opts.userId && /^\d+$/.test(opts.userId)) {
    const [rows] = await pool.query<ResponseRow[]>(
      `SELECT id, form_id, respondent_user_id, session_id, respondent_name, respondent_email,
              answers, status, submitted_at, created_at, updated_at
       FROM form_responses WHERE form_id = ? AND status = 'draft' AND respondent_user_id = ? LIMIT 1`,
      [formId, Number(opts.userId)]
    );
    return rows[0] ?? null;
  }
  if (opts.sessionId) {
    const [rows] = await pool.query<ResponseRow[]>(
      `SELECT id, form_id, respondent_user_id, session_id, respondent_name, respondent_email,
              answers, status, submitted_at, created_at, updated_at
       FROM form_responses
       WHERE form_id = ? AND status = 'draft' AND respondent_user_id IS NULL AND session_id = ? LIMIT 1`,
      [formId, opts.sessionId]
    );
    return rows[0] ?? null;
  }
  return null;
}

export async function insertDraft(input: {
  formId: string;
  userId?: string;
  sessionId?: string | null;
  name?: string;
  email?: string | null;
  answers: Answer[];
}): Promise<ResponseRow> {
  const pool = getPool();
  const uid =
    input.userId && /^\d+$/.test(input.userId)
      ? Number(input.userId)
      : null;
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO form_responses
      (form_id, respondent_user_id, session_id, respondent_name, respondent_email, answers, status)
     VALUES (?, ?, ?, ?, ?, ?, 'draft')`,
    [
      Number(input.formId),
      uid,
      input.sessionId ?? null,
      input.name ?? null,
      input.email ?? null,
      JSON.stringify(input.answers),
    ]
  );
  const row = await findResponseById(String(result.insertId));
  if (!row) throw new Error('[responses] insert draft failed');
  return row;
}

export async function findResponseById(id: string): Promise<ResponseRow | null> {
  if (!/^\d+$/.test(id)) return null;
  const pool = getPool();
  const [rows] = await pool.query<ResponseRow[]>(
    `SELECT id, form_id, respondent_user_id, session_id, respondent_name, respondent_email,
            answers, status, submitted_at, created_at, updated_at
     FROM form_responses WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function updateResponse(input: {
  id: string;
  answers: Answer[];
  status: 'draft' | 'submitted';
  submittedAt: Date | null;
  respondentName?: string | null;
  respondentEmail?: string | null;
}): Promise<ResponseRow | null> {
  if (!/^\d+$/.test(input.id)) return null;
  const pool = getPool();
  await pool.execute<ResultSetHeader>(
    `UPDATE form_responses SET
      answers = ?,
      status = ?,
      submitted_at = ?,
      respondent_name = ?,
      respondent_email = ?
     WHERE id = ?`,
    [
      JSON.stringify(input.answers),
      input.status,
      input.submittedAt,
      input.respondentName ?? null,
      input.respondentEmail ?? null,
      input.id,
    ]
  );
  return findResponseById(input.id);
}

export async function listSubmittedForForm(
  formId: string
): Promise<ResponseRow[]> {
  if (!/^\d+$/.test(formId)) return [];
  const pool = getPool();
  const [rows] = await pool.query<ResponseRow[]>(
    `SELECT r.id, r.form_id, r.respondent_user_id, r.session_id, r.respondent_name, r.respondent_email,
            r.answers, r.status, r.submitted_at, r.created_at, r.updated_at,
            u.name AS user_name, u.email AS user_email
     FROM form_responses r
     LEFT JOIN users u ON r.respondent_user_id = u.id
     WHERE r.form_id = ? AND r.status = 'submitted'
     ORDER BY r.submitted_at DESC`,
    [formId]
  );
  return rows;
}

export async function listSubmittedForFormCsv(formId: string): Promise<ResponseRow[]> {
  if (!/^\d+$/.test(formId)) return [];
  const pool = getPool();
  const [rows] = await pool.query<ResponseRow[]>(
    `SELECT id, form_id, respondent_user_id, session_id, respondent_name, respondent_email,
            answers, status, submitted_at, created_at, updated_at
     FROM form_responses WHERE form_id = ? AND status = 'submitted' ORDER BY submitted_at DESC`,
    [formId]
  );
  return rows;
}
