'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useBuilderStore } from '@/store/builderStore';
import { QuestionList } from './QuestionList';
import { QuestionEditor } from './QuestionEditor';
import { FormRunner } from '@/components/filler/FormRunner';
import { Button } from '@/components/ui/Button';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { cn } from '@/lib/utils';

type Tab = 'build' | 'preview';

export function FormBuilder({ formId }: { formId?: string }) {
  const router = useRouter();
  const {
    form,
    loading,
    saving,
    error,
    loadForm,
    newForm,
    updateFormMeta,
    save,
  } = useBuilderStore();
  const [tab, setTab] = useState<Tab>('build');

  useEffect(() => {
    if (formId) loadForm(formId);
    else newForm();
  }, [formId, loadForm, newForm]);

  async function handleSave() {
    try {
      const saved = await save();
      if (saved) {
        toast.success(saved.isPublished ? 'Form published' : 'Draft saved', {
          description: saved.isPublished
            ? 'Your form is live and accepting responses.'
            : 'Your changes are safe \u2014 find it any time in your list.',
        });
        router.replace('/admin');
      }
    } catch (err) {
      toast.error('Couldn\u2019t save form', {
        description: (err as Error).message,
      });
    }
  }

  if (loading || !form) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-var(--header-height))] max-h-[calc(100dvh-var(--header-height))] max-w-7xl items-center justify-center px-4 sm:px-6">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-var(--header-height))] max-h-[calc(100dvh-var(--header-height))] w-full min-w-0 min-h-0 max-w-7xl flex-col overflow-hidden px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
      {/* ——— Header: fixed; only the two panels below scroll ——— */}
      <div className="shrink-0 space-y-4">
        <div>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/admin');
              }
            }}
            className="group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 -ml-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-white/60 hover:text-slate-800 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            Back to forms
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <input
              value={form.title}
              onChange={(e) => updateFormMeta({ title: e.target.value })}
              className="w-full border-0 bg-transparent p-0 text-2xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-300 focus:ring-0 sm:text-[1.75rem] sm:leading-tight"
              placeholder="Untitled form"
            />
            <input
              value={form.description ?? ''}
              onChange={(e) => updateFormMeta({ description: e.target.value })}
              className="mt-1.5 w-full max-w-2xl border-0 bg-transparent p-0 text-sm text-slate-500 outline-none placeholder:text-slate-400 focus:ring-0"
              placeholder="Add a short description for respondents…"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white/60 px-3.5 py-2 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/60 backdrop-blur-sm">
              <ToggleSwitch
                checked={!!form.isPublished}
                onChange={(v) => updateFormMeta({ isPublished: v })}
                size="sm"
              />
              <span className="select-none text-sm font-medium text-slate-700">
                {form.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>

            <div
              className="inline-flex items-center gap-0.5 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-1 ring-1 ring-slate-200/50 backdrop-blur-sm"
              role="tablist"
            >
              {(['build', 'preview'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'relative rounded-[10px] px-4 py-1.5 text-sm font-medium capitalize transition-all duration-200',
                    tab === t
                      ? 'bg-linear-to-b from-brand-500 to-brand-600 text-white shadow-md shadow-brand-600/20'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <Button
              onClick={handleSave}
              loading={saving}
              className="min-w-[100px] shadow-md shadow-brand-600/20"
            >
              {!saving && <Check size={16} strokeWidth={2.5} />}
              {saving ? 'Saving' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <p className="shrink-0 py-2 text-sm text-red-600">
          <span className="inline-block rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2.5 shadow-sm">
            {error}
          </span>
        </p>
      )}

      <div className="min-h-0 flex-1 pt-3 animate-fade-in sm:pt-4">
        {tab === 'build' ? (
          <div
            className={cn(
              'grid h-full min-h-0 w-full max-w-7xl gap-4',
              'max-lg:grid-cols-1 max-lg:grid-rows-[minmax(0,34vh)_minmax(0,1fr)]',
              'lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:grid-rows-1'
            )}
          >
            <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden">
              <div
                className={cn(
                  'flex h-full min-h-0 flex-col overflow-hidden',
                  'rounded-2xl border border-white/60',
                  'bg-linear-to-b from-white/90 via-white/75 to-slate-50/60',
                  'shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_4px_24px_-4px_rgba(15,23,42,0.08),0_12px_32px_-8px_rgba(99,102,241,0.07)]',
                  'backdrop-blur-sm'
                )}
              >
                <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 scrollbar-thin">
                  <QuestionList />
                </div>
              </div>
            </aside>
            <section className="min-h-0 min-w-0 flex flex-col overflow-hidden">
              <div
                className={cn(
                  'flex h-full min-h-0 flex-col overflow-hidden',
                  'rounded-2xl border border-white/60',
                  'bg-linear-to-b from-white/95 via-white/85 to-slate-50/50',
                  'shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_8px_32px_-6px_rgba(15,23,42,0.1),0_20px_50px_-12px_rgba(99,102,241,0.1)]',
                  'backdrop-blur-sm'
                )}
              >
                <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
                  <div className="p-1 sm:p-1.5">
                    <QuestionEditor />
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-200/80 bg-linear-to-b from-slate-50/40 to-white/80 p-1 shadow-card backdrop-blur-[2px] scrollbar-thin sm:p-2">
            <FormRunner
              form={form}
              isPreview
              onExit={() => setTab('build')}
              exitLabel="Back to builder"
            />
          </div>
        )}
      </div>
    </div>
  );
}
