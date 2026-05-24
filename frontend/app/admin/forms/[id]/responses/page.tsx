'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Pencil, Inbox } from 'lucide-react';
import { toast } from 'sonner';

import { RequireAuth } from '@/components/RequireAuth';
import { downloadCsv, formApi } from '@/lib/api';
import type { Form, FormResponse } from '@shared/types';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

export default function ResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <RequireAuth role="admin">
      <ResponsesView id={id} />
    </RequireAuth>
  );
}

function formatValue(value: unknown) {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

/**
 * Pick the most human-readable label for a submitter:
 *   1. Name (from their account / captured on submit)
 *   2. Email (same sources)
 *   3. Short session id for anonymous fills
 *   4. Fallback
 */
function respondentLabel(r: FormResponse): string {
  if (r.respondent?.name) return r.respondent.name;
  if (r.respondent?.email) return r.respondent.email;
  if (r.respondent?.sessionId) {
    return `Anonymous · ${r.respondent.sessionId.slice(-6)}`;
  }
  return 'Anonymous';
}

function ResponsesView({ id }: { id: string }) {
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [f, r] = await Promise.all([formApi.get(id), formApi.responses(id)]);
        if (cancelled) return;
        setForm(f);
        setResponses(r);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleExport() {
    if (!form || responses.length === 0) return;
    try {
      setDownloading(true);
      await downloadCsv(form.id, `${form.title.replace(/\s+/g, '_')}.csv`);
      toast.success('CSV download started', {
        description: `${responses.length} response${
          responses.length === 1 ? '' : 's'
        } exported.`,
      });
    } catch (err) {
      toast.error('Export failed', { description: (err as Error).message });
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-4 py-16 sm:px-6">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!form) return null;

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 -ml-1 text-sm font-medium text-slate-500 transition-colors hover:bg-white/60 hover:text-slate-800 hover:shadow-sm"
        >
          <ArrowLeft size={16} className="shrink-0" />
          Back to forms
        </Link>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border border-white/50 bg-linear-to-br from-white/90 via-slate-50/40 to-brand-50/25 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_8px_40px_-12px_rgba(99,102,241,0.12)] ring-1 ring-slate-200/50 backdrop-blur-sm sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-300/20 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Responses</p>
            <h1 className="mt-1 text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {form.title}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-2.5 py-0.5 text-xs font-medium text-slate-800 ring-1 ring-slate-200/60">
                <Inbox size={12} className="text-slate-500" aria-hidden />
                {responses.length} submitted response{responses.length === 1 ? '' : 's'}
              </span>
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0 sm:justify-end">
            <Link href={`/admin/forms/${form.id}`} className="w-full min-[480px]:w-auto">
              <Button variant="secondary" className="w-full min-[480px]:w-auto" size="md">
                <Pencil size={14} />
                Edit form
              </Button>
            </Link>
            <Button
              onClick={handleExport}
              loading={downloading}
              disabled={responses.length === 0}
              className="w-full min-[480px]:w-auto"
              size="md"
            >
              <Download size={14} />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {responses.length === 0 ? (
        <div
          className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 p-10 text-center text-slate-600 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm sm:p-12"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100/80 text-slate-500 ring-1 ring-slate-200/60">
            <Inbox size={24} />
          </div>
          <p className="mt-4 text-lg font-semibold text-slate-900">No submissions yet</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Share{' '}
            <Link
              href={`/f/${form.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-700 hover:underline"
            >
              /f/{form.id.slice(-6)}
            </Link>{' '}
            with respondents. New answers show up here automatically.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto overflow-y-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-md shadow-slate-900/5 ring-1 ring-slate-200/40">
          <div className="border-b border-slate-200/60 bg-linear-to-b from-slate-50/80 to-slate-50/30 px-4 py-2.5 sm:px-5">
            <p className="text-xs font-medium text-slate-500">Data grid · scroll horizontally on small screens</p>
          </div>
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="whitespace-nowrap bg-slate-50/50 px-4 py-3 text-left sm:px-5">Submitted</th>
                  <th className="whitespace-nowrap bg-slate-50/50 px-4 py-3 text-left sm:px-5">Respondent</th>
                  {form.questions.map((q) => (
                    <th key={q.id} className="min-w-[140px] bg-slate-50/50 px-4 py-3 text-left sm:px-5">
                      {q.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {responses.map((r) => {
                  const map = new Map(
                    (r.answers ?? []).map((a) => [a.questionId, a.value])
                  );
                  return (
                    <tr key={r.id} className="transition-colors hover:bg-brand-50/30">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700 sm:px-5">
                        {formatDate(r.submittedAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-700 sm:px-5">
                        <div className="font-medium text-slate-900">{respondentLabel(r)}</div>
                        {r.respondent?.email && r.respondent?.name && (
                          <div className="text-xs text-slate-500">{r.respondent.email}</div>
                        )}
                      </td>
                      {form.questions.map((q) => (
                        <td
                          key={q.id}
                          className="max-w-[260px] px-4 py-3 text-slate-700 sm:px-5"
                        >
                          <div className="truncate" title={formatValue(map.get(q.id))}>
                            {formatValue(map.get(q.id))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
