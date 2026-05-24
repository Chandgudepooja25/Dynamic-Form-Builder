/**
 * Logic engine: pure functions that decide what to render next based on
 * accumulated answers. Imported by both the backend (forms/next endpoint)
 * and the frontend (preview + filler) so navigation is consistent.
 */

import type { Answer, Form, LogicRule, Question } from './types';

export const END = 'END';

export function evaluateRule(rule: LogicRule, answerValue: unknown): boolean {
  const { operator, value } = rule;

  switch (operator) {
    case 'equals':
      return String(answerValue) === String(value);
    case 'not_equals':
      return String(answerValue) !== String(value);
    case 'contains':
      if (Array.isArray(answerValue)) {
        return answerValue.map(String).includes(String(value));
      }
      if (typeof answerValue === 'string') {
        return answerValue.toLowerCase().includes(String(value).toLowerCase());
      }
      return false;
    case 'in':
      return Array.isArray(value) && value.map(String).includes(String(answerValue));
    case 'gt':
      return Number(answerValue) > Number(value);
    case 'gte':
      return Number(answerValue) >= Number(value);
    case 'lt':
      return Number(answerValue) < Number(value);
    case 'lte':
      return Number(answerValue) <= Number(value);
    case 'is_empty':
      return (
        answerValue === undefined ||
        answerValue === null ||
        answerValue === '' ||
        (Array.isArray(answerValue) && answerValue.length === 0)
      );
    case 'is_not_empty':
      return !(
        answerValue === undefined ||
        answerValue === null ||
        answerValue === '' ||
        (Array.isArray(answerValue) && answerValue.length === 0)
      );
    default:
      return false;
  }
}

export function getStartQuestion(form: Form): Question | null {
  if (!form.questions.length) return null;
  if (form.startQuestionId) {
    const q = form.questions.find((x) => x.id === form.startQuestionId);
    if (q) return q;
  }
  return form.questions[0];
}

export function findQuestion(form: Form, id: string): Question | null {
  return form.questions.find((q) => q.id === id) ?? null;
}

export function getNextQuestionId(
  current: Question,
  answerValue: unknown,
  form: Form
): string {
  for (const rule of current.logic ?? []) {
    if (evaluateRule(rule, answerValue)) return rule.goTo;
  }
  if (current.defaultNext) return current.defaultNext;

  const idx = form.questions.findIndex((q) => q.id === current.id);
  if (idx === -1 || idx === form.questions.length - 1) return END;
  return form.questions[idx + 1].id;
}

export interface NextResult {
  done: boolean;
  question: Question | null;
}

export function resolveNextQuestion(form: Form, answers: Answer[]): NextResult {
  if (!form.questions.length) return { done: true, question: null };

  if (!answers.length) {
    const start = getStartQuestion(form);
    return start ? { done: false, question: start } : { done: true, question: null };
  }

  const answerMap = new Map(answers.map((a) => [a.questionId, a.value]));
  let current: Question | null = getStartQuestion(form);

  while (current) {
    if (!answerMap.has(current.id)) {
      return { done: false, question: current };
    }
    const nextId = getNextQuestionId(current, answerMap.get(current.id), form);
    if (nextId === END) return { done: true, question: null };
    current = findQuestion(form, nextId);
  }

  return { done: true, question: null };
}
