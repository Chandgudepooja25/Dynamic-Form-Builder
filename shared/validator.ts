import type { Answer, Form, Question } from './types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}

/** Returns the first validation error string, or null if valid. */
export function validateAnswer(question: Question, value: unknown): string | null {
  const v = question.validation ?? {};

  if (v.required && isEmpty(value)) return 'This field is required';
  if (isEmpty(value)) return null;

  switch (question.type) {
    case 'text':
    case 'textarea': {
      if (typeof value !== 'string') return 'Invalid value';
      if (v.minLength && value.length < v.minLength)
        return `Must be at least ${v.minLength} characters`;
      if (v.maxLength && value.length > v.maxLength)
        return `Must be at most ${v.maxLength} characters`;
      if (v.pattern) {
        try {
          if (!new RegExp(v.pattern).test(value)) {
            return v.patternMessage ?? 'Invalid format';
          }
        } catch {
          /* ignore bad regex */
        }
      }
      return null;
    }

    case 'email':
      return typeof value === 'string' && EMAIL_RE.test(value)
        ? null
        : 'Enter a valid email';

    case 'number': {
      const raw = typeof value === 'string' ? value : String(value);
      if (Number.isNaN(Number(raw))) return 'Must be a number';

      const digitCount = raw.replace(/[^0-9]/g, '').length;
      const minDigits = v.minLength;
      const maxDigits = v.maxLength;

      if (minDigits && digitCount < minDigits) {
        return minDigits === maxDigits
          ? `Must be exactly ${minDigits} digits`
          : `Must be at least ${minDigits} digits`;
      }
      if (maxDigits && digitCount > maxDigits) {
        return minDigits === maxDigits
          ? `Must be exactly ${maxDigits} digits`
          : `Must be at most ${maxDigits} digits`;
      }
      return null;
    }

    case 'radio':
    case 'dropdown': {
      const allowed = (question.options ?? []).map((o) => o.value);
      return allowed.includes(String(value)) ? null : 'Invalid selection';
    }

    case 'checkbox': {
      if (!Array.isArray(value)) return 'Invalid value';
      const allowed = new Set((question.options ?? []).map((o) => o.value));
      return value.every((x) => allowed.has(String(x))) ? null : 'Invalid selection';
    }

    default:
      return null;
  }
}

export function validateResponse(form: Form, answers: Answer[]): string[] {
  const byId = new Map(form.questions.map((q) => [q.id, q]));
  const errors: string[] = [];
  for (const a of answers) {
    const q = byId.get(a.questionId);
    if (!q) {
      errors.push(`Unknown question: ${a.questionId}`);
      continue;
    }
    const err = validateAnswer(q, a.value);
    if (err) errors.push(`"${q.title}": ${err}`);
  }
  return errors;
}
