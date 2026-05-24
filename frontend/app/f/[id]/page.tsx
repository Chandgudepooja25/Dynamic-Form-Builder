'use client';

import { use, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FormRunner } from '@/components/filler/FormRunner';
import { formApi, responseApi } from '@/lib/api';
import { getSessionId } from '@/lib/session';
import type { Answer, Form } from '@shared/types';

export default function PublicFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [initialAnswers, setInitialAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sessionId = getSessionId();
        const [f, draft] = await Promise.all([
          formApi.get(id),
          responseApi.getDraft(id, sessionId).catch(() => null),
        ]);
        if (cancelled) return;
        setForm(f);
        if (draft?.answers?.length) {
          setInitialAnswers(draft.answers);
          setDraftNote('We restored your draft — pick up where you left off.');
        }
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

  function handleAnswerChange(answers: Answer[]) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await responseApi.save({
          formId: id,
          sessionId: getSessionId(),
          answers,
          status: 'draft',
        });
      } catch {
        /* silent — drafts are best-effort */
      }
    }, 600);
  }

  async function handleSubmit(answers: Answer[]) {
    setSubmitting(true);
    setError(null);
    try {
      await responseApi.save({
        formId: id,
        sessionId: getSessionId(),
        answers,
        status: 'submitted',
      });
      setSubmitted(true);
      toast.success('Response submitted', {
        description: 'Thanks! Your answers have been recorded.',
      });
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      toast.error('Couldn\u2019t submit response', { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center px-4 py-20 sm:px-6">
        <div
          className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-slate-200/80 bg-white/50 px-8 py-10 shadow-sm ring-1 ring-slate-200/30 backdrop-blur-sm"
          aria-busy
          aria-label="Loading form"
        >
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
          <p className="mt-4 text-sm font-medium text-slate-600">Preparing your form…</p>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <div
          className="rounded-2xl border border-red-200/80 bg-red-50/90 px-6 py-5 text-sm text-red-800 shadow-sm ring-1 ring-red-100/80"
          role="alert"
        >
          <p className="font-semibold">Couldn&apos;t load this form</p>
          <p className="mt-1.5 text-red-700/90">{error}</p>
        </div>
      </div>
    );
  }
  if (!form) return null;

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[min(70vh,720px)] max-w-2xl items-center px-4 py-12 sm:px-6">
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-10 text-center shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_20px_50px_-20px_rgba(16,185,129,0.15)] ring-1 ring-slate-200/40 backdrop-blur-sm sm:p-12">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-100 to-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
            Thanks for your response!
          </h2>
          <p className="mt-2 text-pretty text-slate-600">Your answers have been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {draftNote && (
        <div className="mx-auto max-w-2xl px-4 pt-5 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200/60 bg-linear-to-b from-amber-50/95 to-amber-50/40 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-100/80 shadow-sm">
            <span
              className="flex h-2 w-2 shrink-0 rounded-full bg-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.35)]"
              aria-hidden
            />
            {draftNote}
          </div>
        </div>
      )}
      {error && (
        <div className="mx-auto max-w-2xl px-4 pt-4 text-sm sm:px-6">
          <div className="rounded-xl border border-red-200/80 bg-red-50/90 px-3.5 py-2.5 text-red-800" role="status">
            {error}
          </div>
        </div>
      )}
      <FormRunner
        form={form}
        initialAnswers={initialAnswers}
        onAnswerChange={handleAnswerChange}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}
