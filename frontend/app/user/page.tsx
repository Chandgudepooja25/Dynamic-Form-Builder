'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ClipboardList, FileText, Layers, Sparkles } from 'lucide-react';
import { RequireAuth } from '@/components/RequireAuth';
import { formApi } from '@/lib/api';
import type { Form } from '@shared/types';
import { Badge } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

/**
 * Read-and-submit landing page for end users. RBAC is enforced on the
 * server (`GET /api/forms` returns only published forms for non-admins),
 * so this screen is purely a catalog of forms the user can fill — it has
 * no build / edit / delete affordances.
 */
export default function UserHomePage() {
  return (
    <RequireAuth role="user">
      <Catalog />
    </RequireAuth>
  );
}

function Catalog() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await formApi.list();
        if (!cancelled) setForms(list);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto min-w-0 max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div
        className="relative overflow-hidden rounded-3xl border border-white/60 bg-linear-to-br from-white/90 via-indigo-50/30 to-slate-50/40 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_8px_40px_-12px_rgba(99,102,241,0.12),0_24px_50px_-16px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/50 backdrop-blur-sm sm:p-8"
      >
        <div
          className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-violet-400/15 blur-3xl"
          aria-hidden
        />
        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-brand-400/10 blur-2xl" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden />
              Respondent
            </p>
            <h1 className="mt-1.5 text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Forms for you
            </h1>
            <p className="mt-2 text-pretty text-sm text-slate-600 sm:text-[15px] sm:leading-relaxed">
              Open a published form and submit your answers in one flow. Creating or editing
              forms is limited to your workspace admin.
            </p>
          </div>
        </div>
      </div>

      {!loading && !error && forms.length > 0 && (
        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-sm shadow-sm ring-1 ring-slate-200/30 backdrop-blur-sm sm:px-5">
          <span className="text-slate-500">
            <span className="font-semibold text-slate-800">{forms.length}</span>{' '}
            {forms.length === 1 ? 'form' : 'forms'} ready to complete
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/90 px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            Live
          </span>
        </div>
      )}

      {loading && (
        <div
          className="mt-10 flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-white/50"
          aria-busy
          aria-label="Loading"
        >
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
        </div>
      )}
      {error && (
        <p
          className="mt-6 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800 shadow-sm"
          role="alert"
        >
          {error}
        </p>
      )}

      {!loading && !error && forms.length === 0 && (
        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 p-10 text-center shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm sm:p-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-slate-200/80 to-slate-100 text-slate-500 shadow-inner ring-1 ring-slate-200/80">
            <ClipboardList size={24} strokeWidth={2} />
          </div>
          <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
            No forms available yet
          </h3>
          <p className="mt-1.5 max-w-md mx-auto text-pretty text-sm text-slate-600">
            When an administrator publishes a form, it will show up here. Check back
            later or contact your team for access.
          </p>
        </div>
      )}

      {forms.length > 0 && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((f) => (
            <li key={f.id}>
              <div
                className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-0 shadow-sm ring-1 ring-slate-200/40
                transition-all duration-200
                hover:-translate-y-1 hover:border-brand-200/60 hover:shadow-lg hover:shadow-indigo-950/10"
              >
                <div
                  className="pointer-events-none h-0.5 bg-linear-to-r from-brand-500/0 via-brand-500/50 to-violet-500/0
                  opacity-0 transition duration-200 group-hover:opacity-100"
                />
                <div className="min-h-0 flex-1 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-100 to-indigo-100/80 text-brand-700 ring-1 ring-white/50 shadow-sm"
                        aria-hidden
                      >
                        <FileText size={16} />
                      </span>
                      <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 group-hover:text-brand-900">
                        {f.title}
                      </h3>
                    </div>
                    <Badge tone="green">Live</Badge>
                  </div>
                  {f.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {f.description}
                    </p>
                  )}
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {f.questions.length} question{f.questions.length === 1 ? '' : 's'} · Updated{' '}
                    {formatDate(f.updatedAt)}
                  </p>
                  <div className="mt-5">
                    <Link
                      href={`/f/${f.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 py-2.5 text-sm font-medium text-slate-800
                      shadow-sm transition-all duration-150
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500
                      group-hover:border-brand-200/80 group-hover:bg-linear-to-b group-hover:from-brand-600 group-hover:to-brand-700
                      group-hover:text-white group-hover:shadow-md group-hover:shadow-brand-500/20"
                    >
                      Fill this form
                      <ArrowUpRight
                        className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={2.25}
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
