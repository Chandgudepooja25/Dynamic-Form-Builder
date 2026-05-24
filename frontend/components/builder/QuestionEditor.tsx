'use client';

import { useBuilderStore } from '@/store/builderStore';
import { LogicEditor } from './LogicEditor';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { Badge } from '@/components/ui/Card';
import type { QuestionType } from '@shared/types';
import { cn, newId } from '@/lib/utils';

const TYPES: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'radio', label: 'Multiple choice' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'dropdown', label: 'Dropdown' },
];

const hasOptions = (t: QuestionType) =>
  ['radio', 'checkbox', 'dropdown'].includes(t);
const hasPlaceholder = (t: QuestionType) =>
  ['text', 'textarea', 'email', 'number'].includes(t);

function SectionTitle({
  children,
  hint,
  className,
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4 flex items-end justify-between gap-3', className)}>
      <div>
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          {children}
        </h4>
      </div>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  );
}

export function QuestionEditor() {
  const {
    form,
    selectedId,
    updateQuestion,
    addOption,
    updateOption,
    removeOption,
  } = useBuilderStore();

  if (!form) return null;
  const question = form.questions.find((q) => q.id === selectedId);

  if (!question) {
    return (
      <div className="animate-fade-in rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/40 px-6 py-16 text-center sm:px-8">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-slate-100 to-slate-200/60 text-slate-500 ring-1 ring-slate-200/80">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 6h12M4 10h12M4 14h8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900">No question selected</h3>
        <p className="mt-1 text-sm text-slate-600">
          Pick one from the left panel, or add a new question to get started.
        </p>
      </div>
    );
  }

  const patch = (p: Parameters<typeof updateQuestion>[1]) =>
    updateQuestion(question.id, p);
  const patchValidation = (p: Record<string, unknown>) =>
    patch({ validation: { ...(question.validation ?? {}), ...p } });

  const showValidationFields =
    ['text', 'textarea'].includes(question.type) || question.type === 'number';

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 ring-1 ring-slate-200/30 shadow-sm">
        {/* Sticky: stays visible while scrolling the editor body */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200/60 bg-linear-to-b from-white/90 via-white/80 to-slate-50/70 px-5 py-3.5 backdrop-blur sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <h3 className="truncate text-[15px] font-semibold text-slate-900">Edit question</h3>
            <Badge tone="brand">
              {TYPES.find((t) => t.value === question.type)?.label ?? question.type}
            </Badge>
          </div>
          <span className="shrink-0 max-w-[40%] truncate font-mono text-[10px] text-slate-400 sm:text-[11px]">
            {question.id}
          </span>
        </div>

        {/* Basic fields */}
        <div className="px-6 py-6">
          <SectionTitle>Basic</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Type</Label>
              <Select
                value={question.type}
                onChange={(e) => {
                  const type = e.target.value as QuestionType;
                  const p: Parameters<typeof updateQuestion>[1] = { type };
                  if (hasOptions(type) && !question.options) {
                    p.options = [
                      { id: newId('o'), label: 'Option 1', value: 'Option 1' },
                      { id: newId('o'), label: 'Option 2', value: 'Option 2' },
                    ];
                  }
                  if (!hasOptions(type)) p.options = undefined;
                  patch(p);
                }}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={question.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="What do you want to ask?"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Description (optional)</Label>
              <Input
                value={question.description ?? ''}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder="Give a bit more context for this question…"
              />
            </div>

            {hasPlaceholder(question.type) && (
              <div className="sm:col-span-2">
                <Label>Placeholder</Label>
                <Input
                  value={question.placeholder ?? ''}
                  onChange={(e) => patch({ placeholder: e.target.value })}
                  placeholder="Shown inside the empty input"
                />
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        {hasOptions(question.type) && (
          <>
            <div className="mx-6 border-t border-slate-100" />
            <div className="px-6 py-6">
              <SectionTitle
                hint={`${(question.options ?? []).length} option${
                  (question.options ?? []).length === 1 ? '' : 's'
                }`}
              >
                Options
              </SectionTitle>
              <div className="space-y-2">
                {(question.options ?? []).map((o, idx) => (
                  <div key={o.id} className="flex min-w-0 items-center gap-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xs font-semibold text-slate-500">
                      {idx + 1}
                    </span>
                    <Input
                      className="min-w-0 flex-1"
                      placeholder="Option text"
                      value={o.label}
                      onChange={(e) => {
                        const text = e.target.value;
                        updateOption(question.id, o.id, {
                          label: text,
                          value: text,
                        });
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Remove option"
                      onClick={() => removeOption(question.id, o.id)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M6 6l8 8M14 6l-8 8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className="pt-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => addOption(question.id)}
                  >
                    + Add option
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Validation */}
        <div className="mx-6 border-t border-slate-100" />
        <div className="px-6 py-6">
          <SectionTitle>Validation</SectionTitle>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-900">Required</div>
              <div className="text-xs text-slate-500">
                The respondent must answer before continuing.
              </div>
            </div>
            <ToggleSwitch
              checked={!!question.validation?.required}
              onChange={(v) => patchValidation({ required: v })}
              size="sm"
            />
          </div>

          {showValidationFields && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              {['text', 'textarea'].includes(question.type) && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label>Min length</Label>
                    <Input
                      type="number"
                      value={question.validation?.minLength ?? ''}
                      onChange={(e) =>
                        patchValidation({
                          minLength:
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Max length</Label>
                    <Input
                      type="number"
                      value={question.validation?.maxLength ?? ''}
                      onChange={(e) =>
                        patchValidation({
                          maxLength:
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Pattern (regex)</Label>
                    <Input
                      value={question.validation?.pattern ?? ''}
                      onChange={(e) =>
                        patchValidation({ pattern: e.target.value })
                      }
                      placeholder="^https?://.+"
                    />
                  </div>
                </div>
              )}

              {question.type === 'number' && (
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <Label className="mb-0">Digit count</Label>
                      <span className="text-xs text-slate-400">
                        How many digits to accept (e.g. 10 for a phone number).
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-[11px] text-slate-500">
                          Min digits
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="e.g. 10"
                          value={question.validation?.minLength ?? ''}
                          onChange={(e) =>
                            patchValidation({
                              minLength:
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-500">
                          Max digits
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="e.g. 10"
                          value={question.validation?.maxLength ?? ''}
                          onChange={(e) =>
                            patchValidation({
                              maxLength:
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <LogicEditor question={question} />
    </div>
  );
}
