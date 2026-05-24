import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import type { Question } from '../../../shared/types';
import { getPool } from '../config/db';

export interface FormRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  questions: unknown;
  start_question_id: string | null;
  is_published: number;
  created_by: number | null;
  created_at: Date;
  updated_at: Date;
}

function parseQuestions(raw: unknown): Question[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw as Question[];
  if (typeof raw === 'string') {
    try {
      const v = JSON.parse(raw) as unknown;
      return Array.isArray(v) ? (v as Question[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function formToApi(row: FormRow) {
  const questions = parseQuestions(row.questions);
  return {
    id: String(row.id),
    title: row.title,
    description: row.description ?? '',
    questions,
    startQuestionId: row.start_question_id ?? undefined,
    isPublished: !!row.is_published,
    createdBy:
      row.created_by != null ? String(row.created_by) : undefined,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function countForms(): Promise<number> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS c FROM forms'
  );
  return Number((rows[0] as { c: number }).c);
}

export async function listForms(filter: {
  createdBy?: string;
  isPublished?: boolean;
}): Promise<FormRow[]> {
  const pool = getPool();
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filter.createdBy != null && /^\d+$/.test(filter.createdBy)) {
    clauses.push('created_by = ?');
    params.push(Number(filter.createdBy));
  }
  if (filter.isPublished === true) {
    clauses.push('is_published = 1');
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const [rows] = await pool.query<FormRow[]>(
    `SELECT id, title, description, questions, start_question_id, is_published, created_by, created_at, updated_at FROM forms ${where} ORDER BY updated_at DESC`,
    params
  );
  return rows;
}

export async function findFormById(id: string): Promise<FormRow | null> {
  if (!/^\d+$/.test(id)) return null;
  const pool = getPool();
  const [rows] = await pool.query<FormRow[]>(
    'SELECT id, title, description, questions, start_question_id, is_published, created_by, created_at, updated_at FROM forms WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ?? null;
}

export async function createForm(input: {
  title: string;
  description: string;
  questions: Question[];
  startQuestionId?: string;
  isPublished: boolean;
  createdBy: string;
}): Promise<FormRow> {
  const pool = getPool();
  const qJson = JSON.stringify(input.questions);
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO forms (title, description, questions, start_question_id, is_published, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      input.description,
      qJson,
      input.startQuestionId ?? null,
      input.isPublished ? 1 : 0,
      Number(input.createdBy),
    ]
  );
  const row = await findFormById(String(result.insertId));
  if (!row) throw new Error('[forms] insert succeeded but row not found');
  return row;
}

export async function updateForm(
  id: string,
  ownerUserId: string,
  patch: {
    title?: string;
    description?: string;
    isPublished?: boolean;
    questions?: Question[];
    startQuestionId?: string;
  }
): Promise<FormRow | null> {
  if (!/^\d+$/.test(id) || !/^\d+$/.test(ownerUserId)) return null;
  const pool = getPool();
  const sets: string[] = [];
  const params: (string | number | null)[] = [];

  if (patch.title !== undefined) {
    sets.push('title = ?');
    params.push(patch.title);
  }
  if (patch.description !== undefined) {
    sets.push('description = ?');
    params.push(patch.description);
  }
  if (patch.isPublished !== undefined) {
    sets.push('is_published = ?');
    params.push(patch.isPublished ? 1 : 0);
  }
  if (patch.questions !== undefined) {
    sets.push('questions = ?');
    params.push(JSON.stringify(patch.questions));
    if (patch.startQuestionId !== undefined) {
      sets.push('start_question_id = ?');
      params.push(patch.startQuestionId);
    }
  } else if (patch.startQuestionId !== undefined) {
    sets.push('start_question_id = ?');
    params.push(patch.startQuestionId);
  }

  if (sets.length === 0) {
    return findFormById(id);
  }

  params.push(Number(id), Number(ownerUserId));
  await pool.execute<ResultSetHeader>(
    `UPDATE forms SET ${sets.join(', ')} WHERE id = ? AND created_by = ?`,
    params
  );
  return findFormById(id);
}

export async function deleteForm(
  id: string,
  ownerUserId: string
): Promise<boolean> {
  if (!/^\d+$/.test(id) || !/^\d+$/.test(ownerUserId)) return false;
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM forms WHERE id = ? AND created_by = ?',
    [id, Number(ownerUserId)]
  );
  return result.affectedRows > 0;
}

/** Submitted response counts per form id (numeric string keys). */
export async function countSubmittedByFormIds(
  formIds: string[]
): Promise<Record<string, number>> {
  const ids = formIds.filter((id) => /^\d+$/.test(id)).map((id) => Number(id));
  if (ids.length === 0) return {};
  const pool = getPool();
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT form_id AS formId, COUNT(*) AS cnt FROM form_responses
     WHERE status = 'submitted' AND form_id IN (${placeholders})
     GROUP BY form_id`,
    ids
  );
  const map: Record<string, number> = {};
  for (const r of rows as { formId: number; cnt: number }[]) {
    map[String(r.formId)] = Number(r.cnt);
  }
  return map;
}
