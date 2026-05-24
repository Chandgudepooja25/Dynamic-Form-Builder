'use client';

import { useBuilderStore } from '@/store/builderStore';
import { Button } from '@/components/ui/Button';
import { Input, Select, Label, Hint } from '@/components/ui/Input';
import type { LogicOperator, Question } from '@shared/types';

const OPERATORS: { value: LogicOperator; label: string }[] = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'does not equal' },
  { value: 'contains', label: 'contains' },
  { value: 'in', label: 'is one of (comma separated)' },
  { value: 'gt', label: '>' },
  { value: 'gte', label: '>=' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '<=' },
  { value: 'is_empty', label: 'is empty' },
  { value: 'is_not_empty', label: 'is not empty' },
];

export function LogicEditor({ question }: { question: Question }) {
  const {
    form,
    addLogicRule,
    updateLogicRule,
    removeLogicRule,
    updateQuestion,
  } = useBuilderStore();
  if (!form) return null;

  const targetOptions = [
    ...form.questions
      .filter((q) => q.id !== question.id)
      .map((q) => ({ value: q.id, label: q.title || q.id })),
    { value: 'END', label: 'End of form' },
  ];

  function parseValue(raw: string, operator: LogicOperator) {
    if (operator === 'in') {
      return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return raw;
  }

  const rules = question.logic ?? [];

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/45 p-5 shadow-sm ring-1 ring-slate-200/25 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Conditional logic
          </h3>
          <Hint>
            Rules are checked top-to-bottom. First match decides the next question.
          </Hint>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => addLogicRule(question.id)}
        >
          + Add rule
        </Button>
      </div>

      {rules.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          No rules yet — the form will move to the default next question.
        </div>
      )}

      <div className="space-y-2">
        {rules.map((rule, idx) => {
          const needsValue = !['is_empty', 'is_not_empty'].includes(rule.operator);
          const valueStr = Array.isArray(rule.value)
            ? rule.value.join(', ')
            : rule.value ?? '';

          return (
            <div
              key={idx}
              className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2"
            >
              <Select
                value={rule.operator}
                onChange={(e) =>
                  updateLogicRule(question.id, idx, {
                    operator: e.target.value as LogicOperator,
                  })
                }
              >
                {OPERATORS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Input
                type="text"
                placeholder={needsValue ? 'value' : 'n/a'}
                disabled={!needsValue}
                value={String(valueStr)}
                onChange={(e) =>
                  updateLogicRule(question.id, idx, {
                    value: parseValue(e.target.value, rule.operator),
                  })
                }
              />
              <Select
                value={rule.goTo}
                onChange={(e) =>
                  updateLogicRule(question.id, idx, { goTo: e.target.value })
                }
              >
                {targetOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    → {o.label}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => removeLogicRule(question.id, idx)}
                aria-label="Remove rule"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <Label>Default next question</Label>
        <Select
          value={question.defaultNext ?? ''}
          onChange={(e) =>
            updateQuestion(question.id, { defaultNext: e.target.value })
          }
        >
          <option value="">— default (next in order) —</option>
          {targetOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
