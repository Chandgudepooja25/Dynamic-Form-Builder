/**
 * Shared TypeScript types for forms, questions, logic, and responses.
 * Both backend (models, controllers) and frontend (components, stores)
 * import from here so shapes never drift.
 */

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'radio'
  | 'checkbox'
  | 'dropdown';

export type LogicOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'in'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'is_empty'
  | 'is_not_empty';

export interface Option {
  id: string;
  label: string;
  value: string;
}

export interface Validation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface LogicRule {
  operator: LogicOperator;
  value?: string | number | string[];
  goTo: string; // question id, or the literal "END"
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  placeholder?: string;
  options?: Option[];
  validation?: Validation;
  logic?: LogicRule[];
  defaultNext?: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  startQuestionId?: string;
  isPublished: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Answer {
  questionId: string;
  value: unknown;
}

export interface FormResponse {
  id: string;
  formId: string;
  respondent: {
    userId?: string;
    sessionId?: string;
    name?: string;
    email?: string;
  };
  answers: Answer[];
  status: 'draft' | 'submitted';
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Admin dashboard row: form + aggregate info for the listing table. */
export interface FormSummary extends Form {
  responseCount?: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}
