'use client';

import { GripVertical } from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';
import { cn } from '@/lib/utils';
import type { QuestionType } from '@shared/types';

const TYPE_LABELS: Record<QuestionType, string> = {
  text: 'Text',
  textarea: 'Long text',
  email: 'Email',
  number: 'Number',
  radio: 'Multiple choice',
  checkbox: 'Checkboxes',
  dropdown: 'Dropdown',
};

// Subtle color accent per question type — used as a small dot on the list item
// and as the accent of the "add question" pill buttons.
const TYPE_ACCENT: Record<QuestionType, string> = {
  text: 'bg-sky-500',
  textarea: 'bg-indigo-500',
  email: 'bg-violet-500',
  number: 'bg-emerald-500',
  radio: 'bg-amber-500',
  checkbox: 'bg-rose-500',
  dropdown: 'bg-teal-500',
};

function TypeIcon({ type, className }: { type: QuestionType; className?: string }) {
  // Tiny inline icons – compact, monochrome, uses currentColor.
  const props = {
    width: 14,
    height: 14,
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };
  switch (type) {
    case 'text':
      return (
        <svg {...props}>
          <path d="M4 7V5h12v2M10 5v10M7 15h6" />
        </svg>
      );
    case 'textarea':
      return (
        <svg {...props}>
          <path d="M3 5h14M3 10h14M3 15h9" />
        </svg>
      );
    case 'email':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="14" height="10" rx="2" />
          <path d="M3 7l7 5 7-5" />
        </svg>
      );
    case 'number':
      return (
        <svg {...props}>
          <path d="M6 4l-2 12M14 4l-2 12M3 8h13M3 12h13" />
        </svg>
      );
    case 'radio':
      return (
        <svg {...props}>
          <circle cx="10" cy="10" r="6" />
          <circle cx="10" cy="10" r="2.5" fill="currentColor" />
        </svg>
      );
    case 'checkbox':
      return (
        <svg {...props}>
          <rect x="3.5" y="3.5" width="13" height="13" rx="2.5" />
          <path d="M6.5 10.5l2.5 2.5 4.5-5" />
        </svg>
      );
    case 'dropdown':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="14" height="10" rx="2" />
          <path d="M8 9l2 2 2-2" />
        </svg>
      );
  }
}

export function QuestionList() {
  const {
    form,
    selectedId,
    selectQuestion,
    addQuestion,
    moveQuestion,
    removeQuestion,
  } = useBuilderStore();
  if (!form) return null;

  const isEmpty = form.questions.length === 0;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Questions
        </h3>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] font-semibold text-slate-600">
          {form.questions.length}
        </span>
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-6 text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4v12M4 10h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">No questions yet</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Pick a type below to start.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {form.questions.map((q, idx) => {
            const active = selectedId === q.id;
            return (
              <div
                key={q.id}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                onClick={() => selectQuestion(q.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectQuestion(q.id);
                  }
                }}
                className={cn(
                  'group relative w-full cursor-pointer rounded-xl border px-3 py-2.5 text-left transition-all duration-150',
                  active
                    ? 'border-brand-200 bg-brand-50/70 shadow-[inset_3px_0_0_0_var(--color-brand-600)]'
                    : 'border-slate-200 bg-white hover:-translate-y-px hover:border-slate-300 hover:shadow-card'
                )}
              >
                <div className="flex items-start gap-1.5 sm:gap-2.5">
                  <span
                    className="mt-1.5 flex shrink-0 text-slate-300 opacity-0 transition-[opacity,transform] group-hover:opacity-100"
                    aria-hidden
                  >
                    <GripVertical className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                  <div
                    className={cn(
                      'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-sm',
                      TYPE_ACCENT[q.type]
                    )}
                    aria-hidden
                  >
                    <TypeIcon type={q.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        'text-[10px] font-semibold uppercase tracking-[0.08em]',
                        active ? 'text-brand-700' : 'text-slate-500'
                      )}
                    >
                      {TYPE_LABELS[q.type]}
                    </div>
                    <div className="truncate text-sm font-medium text-slate-900">
                      {idx + 1}. {q.title || 'Untitled'}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <IconBtn
                      label="Move up"
                      onClick={() => moveQuestion(q.id, -1)}
                    >
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M5 12l5-5 5 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </IconBtn>
                    <IconBtn
                      label="Move down"
                      onClick={() => moveQuestion(q.id, 1)}
                    >
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M5 8l5 5 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </IconBtn>
                    <IconBtn
                      label="Delete"
                      onClick={() => removeQuestion(q.id)}
                      tone="danger"
                    >
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M6 6l8 8M14 6l-8 8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </IconBtn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 border-t border-slate-200/80 pt-4">
        <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          Add question
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(TYPE_LABELS) as [QuestionType, string][]).map(
            ([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() => addQuestion(type)}
                className="group/btn active:scale-[0.99] inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300/80 hover:bg-linear-to-b hover:from-brand-50/90 hover:to-brand-50/50 hover:text-brand-800 hover:shadow-md"
              >
                <span
                  className={cn(
                    'inline-block h-1.5 w-1.5 rounded-full',
                    TYPE_ACCENT[type]
                  )}
                  aria-hidden
                />
                <span>+ {label}</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  tone = 'default',
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => e.stopPropagation()}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors',
        tone === 'danger'
          ? 'hover:bg-red-50 hover:text-red-600'
          : 'hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      {children}
    </button>
  );
}
