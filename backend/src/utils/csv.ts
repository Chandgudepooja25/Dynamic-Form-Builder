import type { Answer, Form, FormResponse } from '../../../shared/types';

function escapeCell(value: unknown): string {
  if (value === undefined || value === null) return '';
  let str: string;
  if (Array.isArray(value)) str = value.join('; ');
  else if (typeof value === 'object') str = JSON.stringify(value);
  else str = String(value);

  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function responsesToCsv(form: Form, responses: FormResponse[]): string {
  const headers = [
    'response_id',
    'submitted_at',
    'respondent_email',
    ...form.questions.map((q) => q.title),
  ];

  const lines = [headers.map(escapeCell).join(',')];

  for (const r of responses) {
    const answerMap = new Map(
      (r.answers as Answer[]).map((a) => [a.questionId, a.value])
    );
    const row = [
      r.id,
      r.submittedAt ? new Date(r.submittedAt).toISOString() : '',
      r.respondent?.email ?? '',
      ...form.questions.map((q) => answerMap.get(q.id)),
    ];
    lines.push(row.map(escapeCell).join(','));
  }

  return lines.join('\n');
}
