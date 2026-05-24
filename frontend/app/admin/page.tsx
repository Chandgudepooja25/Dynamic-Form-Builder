'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Inbox,
  Pencil,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

import { RequireAuth } from '@/components/RequireAuth';
import { formApi } from '@/lib/api';
import type { FormSummary } from '@shared/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  return (
    <RequireAuth role="admin">
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  const router = useRouter();
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<FormSummary | null>(null);

  async function load() {
    try {
      setLoading(true);
      const list = await formApi.list();
      setForms(list);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onConfirmDelete() {
    if (!toDelete) return;
    try {
      await formApi.remove(toDelete.id);
      setForms((s) => s.filter((f) => f.id !== toDelete.id));
      toast.success('Form deleted', {
        description: `"${toDelete.title}" has been removed.`,
      });
    } catch (err) {
      toast.error('Couldn\u2019t delete form', {
        description: (err as Error).message,
      });
      throw err;
    }
  }

  const totalResponses = forms.reduce((sum, f) => sum + (f.responseCount ?? 0), 0);
  const publishedCount = forms.filter((f) => f.isPublished).length;

  return (
    <div className="mx-auto min-w-0 max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* — Hero + primary action — */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/60 bg-linear-to-br from-white/90 via-slate-50/50 to-brand-50/35 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_8px_40px_-12px_rgba(99,102,241,0.15),0_24px_50px_-16px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/50 backdrop-blur-sm sm:p-8"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-400/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-violet-400/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Admin workspace
            </p>
            <h1 className="mt-1.5 text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Your forms
            </h1>
            <p className="mt-2 text-pretty text-sm text-slate-600 sm:text-[15px] sm:leading-relaxed">
              Build logic-driven forms, share public links, and keep every submission in
              one place.
            </p>
          </div>
          <Button
            onClick={() => router.push('/admin/forms/new')}
            className="shrink-0 shadow-lg shadow-brand-600/25"
            size="lg"
          >
            <Plus size={18} strokeWidth={2.5} />
            New form
          </Button>
        </div>
      </div>

      {!loading && forms.length > 0 && (
        <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <StatCard
            icon={<BarChart3 size={18} />}
            label="Total forms"
            value={forms.length}
            hint="in workspace"
            accent="brand"
          />
          <StatCard
            icon={<ExternalLink size={18} />}
            label="Live"
            value={publishedCount}
            hint="public links on"
            accent="emerald"
          />
          <StatCard
            icon={<Inbox size={18} />}
            label="Submissions"
            value={totalResponses}
            hint="all-time"
            accent="violet"
          />
        </div>
      )}

      {loading && (
        <div
          className="mt-10 flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-white/50 backdrop-blur-sm"
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

      {!loading && forms.length === 0 && (
        <div
          className="mt-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 p-10 text-center shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm sm:p-14"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-brand-100 to-brand-200/50 text-brand-700 shadow-inner ring-1 ring-brand-200/60">
            <Inbox size={24} strokeWidth={2} />
          </div>
          <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
            No forms yet
          </h3>
          <p className="mt-1.5 max-w-md mx-auto text-pretty text-sm text-slate-600">
            Create a form, add questions and branching logic, then share the link to start
            collecting answers.
          </p>
          <Button className="mt-7" size="lg" onClick={() => router.push('/admin/forms/new')}>
            <Plus size={16} strokeWidth={2.5} />
            Create a form
          </Button>
        </div>
      )}

      {forms.length > 0 && (
        <div
          className="mt-8 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-md shadow-slate-900/5 ring-1 ring-slate-200/40 backdrop-blur-[2px]"
        >
          <div className="border-b border-slate-200/60 bg-linear-to-b from-slate-50/90 to-slate-50/40 px-4 py-3.5 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-800">All forms</h2>
            <p className="text-xs text-slate-500">Manage, respond to submissions, and share</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="whitespace-nowrap bg-slate-50/50 px-4 py-3 text-left sm:px-5">Title</th>
                  <th className="whitespace-nowrap bg-slate-50/50 px-4 py-3 text-left sm:px-5">Questions</th>
                  <th className="whitespace-nowrap bg-slate-50/50 px-4 py-3 text-left sm:px-5">Responses</th>
                  <th className="whitespace-nowrap bg-slate-50/50 px-4 py-3 text-left sm:px-5">Status</th>
                  <th className="whitespace-nowrap bg-slate-50/50 px-4 py-3 text-left sm:px-5">Share</th>
                  <th className="whitespace-nowrap bg-slate-50/50 px-4 py-3 text-right sm:px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {forms.map((f) => {
                  const count = f.responseCount ?? 0;
                  return (
                    <tr
                      key={f.id}
                      className="transition-colors hover:bg-brand-50/40"
                    >
                      <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                        <div className="font-medium text-slate-900">{f.title}</div>
                        <div className="text-xs text-slate-500">
                          Updated {formatDate(f.updatedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-slate-600 sm:px-5 sm:py-4">
                        {f.questions.length}
                      </td>
                      <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                        <Link
                          href={`/admin/forms/${f.id}/responses`}
                          className={
                            count > 0
                              ? 'inline-flex items-center gap-1.5 font-medium text-brand-700 transition-colors hover:text-brand-800 hover:underline'
                              : 'inline-flex items-center gap-1.5 text-slate-500 transition-colors hover:text-slate-700'
                          }
                        >
                          <Inbox size={14} />
                          {count}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                        {f.isPublished ? (
                          <Badge tone="green">Published</Badge>
                        ) : (
                          <Badge tone="gray">Draft</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                        <Link
                          href={`/f/${f.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1.5 text-brand-700 tabular-nums"
                        >
                          <span className="rounded-md bg-slate-100/80 px-1.5 py-0.5 text-[11px] text-slate-600 transition group-hover:bg-brand-100/80 group-hover:text-brand-800">
                            /f/…{f.id.slice(-6)}
                          </span>
                          <ExternalLink size={12} className="shrink-0 opacity-60 group-hover:opacity-100" />
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                        <div className="flex flex-wrap justify-end gap-1.5 sm:gap-2">
                          <Link href={`/admin/forms/${f.id}/responses`}>
                            <Button size="sm" variant="secondary" className="whitespace-nowrap">
                              <Inbox size={14} />
                              Responses
                            </Button>
                          </Link>
                          <Link href={`/admin/forms/${f.id}`}>
                            <Button size="sm" variant="secondary" className="whitespace-nowrap">
                              <Pencil size={14} />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setToDelete(f)}
                            aria-label={`Delete ${f.title}`}
                          >
                            <Trash2 size={14} />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this form?"
        description={
          toDelete ? (
            <>
              <strong>&ldquo;{toDelete.title}&rdquo;</strong> will be permanently
              removed along with its{' '}
              {toDelete.responseCount ?? 0} submitted response
              {(toDelete.responseCount ?? 0) === 1 ? '' : 's'}. This action
              can&apos;t be undone.
            </>
          ) : null
        }
        confirmLabel="Delete form"
        cancelLabel="Keep form"
        tone="danger"
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accent = 'brand',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
  accent?: 'brand' | 'emerald' | 'violet';
}) {
  const acc =
    accent === 'emerald'
      ? {
          icon: 'from-emerald-500 to-emerald-600 ring-emerald-50/20',
          line: 'from-emerald-200/0 via-emerald-200/50 to-emerald-200/0',
        }
      : accent === 'violet'
        ? {
            icon: 'from-violet-500 to-violet-600 ring-violet-100/20',
            line: 'from-violet-200/0 via-violet-200/50 to-violet-200/0',
          }
        : {
            icon: 'from-brand-500 to-brand-600 ring-indigo-50/30',
            line: 'from-brand-200/0 via-brand-200/50 to-brand-200/0',
          };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-3.5 shadow-sm ring-1 ring-slate-200/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/5"
    >
      <div
        className={cn(
          'absolute inset-x-5 top-0 h-0.5 rounded-full bg-linear-to-r transition-opacity',
          'opacity-0 group-hover:opacity-100',
          acc.line
        )}
        aria-hidden
      />
      <div className="flex items-center gap-3.5">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-sm ring-1 ring-inset',
            acc.icon
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {label}
          </div>
          <div className="text-2xl font-bold tabular-nums leading-tight tracking-tight text-slate-900">
            {value}
          </div>
          {hint && <div className="mt-0.5 text-[11px] text-slate-400">{hint}</div>}
        </div>
      </div>
    </div>
  );
}
