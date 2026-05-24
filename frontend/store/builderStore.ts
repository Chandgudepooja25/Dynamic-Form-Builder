'use client';

import { create } from 'zustand';
import { formApi } from '@/lib/api';
import { newId } from '@/lib/utils';
import type { Form, Question, QuestionType, Option, LogicRule } from '@shared/types';

function emptyQuestion(type: QuestionType = 'text'): Question {
  const base: Question = {
    id: newId('q'),
    type,
    title: 'Untitled question',
    description: '',
    placeholder: '',
    validation: { required: false },
    logic: [],
    defaultNext: '',
  };
  if (['radio', 'checkbox', 'dropdown'].includes(type)) {
    base.options = [
      { id: newId('o'), label: 'Option 1', value: 'Option 1' },
      { id: newId('o'), label: 'Option 2', value: 'Option 2' },
    ];
  }
  return base;
}

interface BuilderState {
  form: Form | null;
  selectedId: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;

  newForm: () => void;
  loadForm: (id: string) => Promise<void>;
  selectQuestion: (id: string) => void;
  updateFormMeta: (patch: Partial<Form>) => void;

  addQuestion: (type?: QuestionType) => void;
  removeQuestion: (id: string) => void;
  moveQuestion: (id: string, delta: number) => void;
  updateQuestion: (id: string, patch: Partial<Question>) => void;

  addOption: (qid: string) => void;
  updateOption: (qid: string, oid: string, patch: Partial<Option>) => void;
  removeOption: (qid: string, oid: string) => void;

  addLogicRule: (qid: string) => void;
  updateLogicRule: (qid: string, idx: number, patch: Partial<LogicRule>) => void;
  removeLogicRule: (qid: string, idx: number) => void;

  save: () => Promise<Form | null>;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  form: null,
  selectedId: null,
  loading: false,
  saving: false,
  error: null,

  newForm: () => {
    const q = emptyQuestion('text');
    set({
      form: {
        id: '',
        title: 'Untitled form',
        description: '',
        questions: [q],
        startQuestionId: q.id,
        isPublished: false,
      },
      selectedId: q.id,
      error: null,
    });
  },

  async loadForm(id) {
    set({ loading: true, error: null });
    try {
      const form = await formApi.get(id);
      set({ form, selectedId: form.questions[0]?.id ?? null, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  selectQuestion: (id) => set({ selectedId: id }),

  updateFormMeta: (patch) =>
    set((s) => (s.form ? { form: { ...s.form, ...patch } } : s)),

  addQuestion: (type = 'text') =>
    set((s) => {
      if (!s.form) return s;
      const q = emptyQuestion(type);
      return {
        form: { ...s.form, questions: [...s.form.questions, q] },
        selectedId: q.id,
      };
    }),

  removeQuestion: (id) =>
    set((s) => {
      if (!s.form) return s;
      const questions = s.form.questions.filter((q) => q.id !== id);
      const startQuestionId =
        s.form.startQuestionId === id ? questions[0]?.id : s.form.startQuestionId;
      return {
        form: { ...s.form, questions, startQuestionId },
        selectedId: questions[0]?.id ?? null,
      };
    }),

  moveQuestion: (id, delta) =>
    set((s) => {
      if (!s.form) return s;
      const idx = s.form.questions.findIndex((q) => q.id === id);
      if (idx === -1) return s;
      const next = [...s.form.questions];
      const target = idx + delta;
      if (target < 0 || target >= next.length) return s;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { form: { ...s.form, questions: next } };
    }),

  updateQuestion: (id, patch) =>
    set((s) =>
      s.form
        ? {
            form: {
              ...s.form,
              questions: s.form.questions.map((q) =>
                q.id === id ? { ...q, ...patch } : q
              ),
            },
          }
        : s
    ),

  addOption: (qid) =>
    set((s) =>
      s.form
        ? {
            form: {
              ...s.form,
              questions: s.form.questions.map((q) => {
                if (q.id !== qid) return q;
                const n = (q.options?.length ?? 0) + 1;
                return {
                  ...q,
                  options: [
                    ...(q.options ?? []),
                    { id: newId('o'), label: `Option ${n}`, value: `Option ${n}` },
                  ],
                };
              }),
            },
          }
        : s
    ),

  updateOption: (qid, oid, patch) =>
    set((s) =>
      s.form
        ? {
            form: {
              ...s.form,
              questions: s.form.questions.map((q) =>
                q.id !== qid
                  ? q
                  : {
                      ...q,
                      options: q.options?.map((o) =>
                        o.id === oid ? { ...o, ...patch } : o
                      ),
                    }
              ),
            },
          }
        : s
    ),

  removeOption: (qid, oid) =>
    set((s) =>
      s.form
        ? {
            form: {
              ...s.form,
              questions: s.form.questions.map((q) =>
                q.id !== qid
                  ? q
                  : { ...q, options: q.options?.filter((o) => o.id !== oid) }
              ),
            },
          }
        : s
    ),

  addLogicRule: (qid) =>
    set((s) =>
      s.form
        ? {
            form: {
              ...s.form,
              questions: s.form.questions.map((q) =>
                q.id !== qid
                  ? q
                  : {
                      ...q,
                      logic: [
                        ...(q.logic ?? []),
                        { operator: 'equals', value: '', goTo: 'END' },
                      ],
                    }
              ),
            },
          }
        : s
    ),

  updateLogicRule: (qid, idx, patch) =>
    set((s) =>
      s.form
        ? {
            form: {
              ...s.form,
              questions: s.form.questions.map((q) => {
                if (q.id !== qid) return q;
                const logic = [...(q.logic ?? [])];
                logic[idx] = { ...logic[idx], ...patch };
                return { ...q, logic };
              }),
            },
          }
        : s
    ),

  removeLogicRule: (qid, idx) =>
    set((s) =>
      s.form
        ? {
            form: {
              ...s.form,
              questions: s.form.questions.map((q) => {
                if (q.id !== qid) return q;
                const logic = [...(q.logic ?? [])];
                logic.splice(idx, 1);
                return { ...q, logic };
              }),
            },
          }
        : s
    ),

  async save() {
    const form = get().form;
    if (!form) return null;
    set({ saving: true, error: null });
    try {
      const saved = form.id
        ? await formApi.update(form.id, form)
        : await formApi.create(form);
      set({ form: saved, saving: false });
      return saved;
    } catch (err) {
      set({ saving: false, error: (err as Error).message });
      throw err;
    }
  },
}));
