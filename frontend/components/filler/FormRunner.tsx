'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from './ProgressBar';
import { QuestionRenderer } from './QuestionRenderer';
import {
  END,
  findQuestion,
  getNextQuestionId,
  getStartQuestion,
} from '@shared/logicEngine';
import { validateAnswer } from '@shared/validator';
import type { Answer, Form } from '@shared/types';

interface Props {
  form: Form;
  initialAnswers?: Answer[];
  onAnswerChange?: (answers: Answer[]) => void;
  onSubmit?: (answers: Answer[]) => void;
  submitting?: boolean;
  isPreview?: boolean;
  /**
   * Optional fallback for the "← Back" button when we're on the first
   * question and there's no prior step to pop. Used by the preview view to
   * let users exit back to the builder instead of being stuck on a disabled
   * button.
   */
  onExit?: () => void;
  /** Custom label shown on the Back button when `onExit` fires. */
  exitLabel?: string;
}

export function FormRunner({
  form,
  initialAnswers = [],
  onAnswerChange,
  onSubmit,
  submitting = false,
  isPreview = false,
  onExit,
  exitLabel = 'Exit preview',
}: Props) {
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [history, setHistory] = useState<string[]>(() => {
    if (!initialAnswers.length) {
      const start = getStartQuestion(form);
      return start ? [start.id] : [];
    }
    const path: string[] = [];
    let current = getStartQuestion(form);
    const map = new Map(initialAnswers.map((a) => [a.questionId, a.value]));
    while (current) {
      path.push(current.id);
      if (!map.has(current.id)) break;
      const nextId = getNextQuestionId(current, map.get(current.id), form);
      if (nextId === END) break;
      current = findQuestion(form, nextId);
    }
    return path;
  });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const currentId = history[history.length - 1];
  const currentQuestion = currentId ? findQuestion(form, currentId) : null;
  const currentAnswer = useMemo(
    () => answers.find((a) => a.questionId === currentId)?.value,
    [answers, currentId]
  );

  const progress = useMemo(() => {
    const total = form.questions.length || 1;
    const answered = new Set(answers.map((a) => a.questionId)).size;
    return Math.round((answered / total) * 100);
  }, [answers, form]);

  function setAnswer(value: unknown) {
    setError(null);
    setAnswers((prev) => {
      const rest = prev.filter((a) => a.questionId !== currentId);
      const next = [...rest, { questionId: currentId, value }];
      onAnswerChange?.(next);
      return next;
    });
  }

  function handleNext() {
    if (!currentQuestion) return;
    const err = validateAnswer(currentQuestion, currentAnswer);
    if (err) {
      setError(err);
      return;
    }
    const nextId = getNextQuestionId(currentQuestion, currentAnswer, form);
    if (nextId === END) {
      setDone(true);
      if (!isPreview) onSubmit?.(answers);
      return;
    }
    setHistory((h) => [...h, nextId]);
  }

  function handleBack() {
    setError(null);
    if (history.length <= 1) {
      // No previous question to pop — fall through to the parent's exit
      // handler (e.g. switch from Preview back to Build) if provided.
      onExit?.();
      return;
    }
    setHistory((h) => h.slice(0, -1));
  }

  const onFirstStep = history.length <= 1;
  const backLabel = onFirstStep && onExit ? `← ${exitLabel}` : '← Back';
  const backDisabled = onFirstStep && !onExit;

  function restart() {
    setAnswers([]);
    const start = getStartQuestion(form);
    setHistory(start ? [start.id] : []);
    setDone(false);
    setError(null);
  }

  if (!form.questions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
        This form has no questions yet.
      </div>
    );
  }

  if (done) {
    return (
      <FillerShell>
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">
            {isPreview ? 'Preview complete' : 'Thanks for your response!'}
          </h2>
          <p className="mt-1 text-slate-600">
            {isPreview
              ? 'In the live form, answers are saved on submission.'
              : 'Your answers have been recorded.'}
          </p>
          <div className="mt-6 flex justify-center">
            <Button variant="secondary" onClick={restart}>
              Start again
            </Button>
          </div>
        </div>
      </FillerShell>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
        No question to show.
      </div>
    );
  }

  return (
    <FillerShell progress={progress}>
      <div key={currentQuestion.id} className="animate-slide-up">
        <h2 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
          {currentQuestion.title}
        </h2>
        {currentQuestion.description && (
          <p className="mt-2 text-slate-600">{currentQuestion.description}</p>
        )}

        <div className="mt-6">
          <QuestionRenderer
            question={currentQuestion}
            value={currentAnswer}
            onChange={setAnswer}
            onEnter={handleNext}
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={backDisabled}
          >
            {backLabel}
          </Button>
          <Button onClick={handleNext} loading={submitting}>
            Next →
          </Button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Question {history.length} · {form.questions.length} total · Press{' '}
          <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">
            Enter
          </kbd>{' '}
          to continue
        </p>
      </div>
    </FillerShell>
  );
}

function FillerShell({
  children,
  progress,
}: {
  children: React.ReactNode;
  progress?: number;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-4 py-10 sm:px-6">
      {progress !== undefined && (
        <div className="mb-6">
          <ProgressBar percent={progress} />
        </div>
      )}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        {children}
      </div>
    </div>
  );
}
