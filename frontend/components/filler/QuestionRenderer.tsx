'use client';

import { Input, Select, Textarea } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { Question } from '@shared/types';

interface Props {
  question: Question;
  value: unknown;
  onChange: (v: unknown) => void;
  onEnter?: () => void;
}

export function QuestionRenderer({ question, value, onChange, onEnter }: Props) {
  const t = question.type;

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && t !== 'textarea') {
      e.preventDefault();
      onEnter?.();
    }
  }

  if (t === 'text' || t === 'email' || t === 'number') {
    return (
      <Input
        autoFocus
        type={t === 'number' ? 'number' : t}
        placeholder={question.placeholder ?? ''}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
      />
    );
  }

  if (t === 'textarea') {
    return (
      <Textarea
        autoFocus
        placeholder={question.placeholder ?? ''}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (t === 'dropdown') {
    return (
      <Select
        autoFocus
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— Select —</option>
        {(question.options ?? []).map((o) => (
          <option key={o.id} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    );
  }

  if (t === 'radio') {
    return (
      <div className="space-y-2.5">
        {(question.options ?? []).map((o) => {
          const selected = value === o.value;
          return (
            <label
              key={o.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                selected
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <input
                type="radio"
                name={question.id}
                checked={selected}
                onChange={() => onChange(o.value)}
                className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="font-medium">{o.label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (t === 'checkbox') {
    const arr = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="space-y-2.5">
        {(question.options ?? []).map((o) => {
          const selected = arr.includes(o.value);
          return (
            <label
              key={o.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                selected
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => {
                  if (e.target.checked) onChange([...arr, o.value]);
                  else onChange(arr.filter((x) => x !== o.value));
                }}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="font-medium">{o.label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  return <p className="text-sm text-slate-500">Unsupported question type: {t}</p>;
}
