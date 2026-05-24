import type { Response, NextFunction } from 'express';
import * as formsRepo from '../repos/formsRepo';
import * as responsesRepo from '../repos/responsesRepo';
import { ApiError } from '../utils/ApiError';
import { newId } from '../utils/newId';
import { responsesToCsv } from '../utils/csv';
import { resolveNextQuestion } from '../../../shared/logicEngine';
import type { Answer, Form, FormResponse, Question } from '../../../shared/types';
import type { AuthedRequest } from '../middleware/auth';

function normalizeQuestions(questions: Question[] = []) {
  return questions.map((q) => ({ ...q, id: q.id || newId('q') }));
}

async function getSubmissionCounts(
  formIds: string[]
): Promise<Record<string, number>> {
  return formsRepo.countSubmittedByFormIds(formIds);
}

export async function list(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.auth;
    if (!user) throw new ApiError('Authentication required', 401);

    const filter =
      user.role === 'admin'
        ? { createdBy: user.id }
        : { isPublished: true as const };

    const rows = await formsRepo.listForms(filter);
    const payload = rows.map((f) => formsRepo.formToApi(f));

    if (user.role === 'admin') {
      const counts = await getSubmissionCounts(
        payload.map((p) => String(p.id))
      );
      for (const p of payload) {
        (p as { responseCount?: number }).responseCount =
          counts[String(p.id)] ?? 0;
      }
    }

    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.auth!;
    const payload = req.body ?? {};
    const questions = normalizeQuestions(payload.questions);
    const row = await formsRepo.createForm({
      title: payload.title,
      description: payload.description ?? '',
      questions,
      startQuestionId: payload.startQuestionId || questions[0]?.id,
      isPublished: !!payload.isPublished,
      createdBy: user.id,
    });
    res.status(201).json(formsRepo.formToApi(row));
  } catch (err) {
    next(err);
  }
}

export async function getOne(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const row = await formsRepo.findFormById(id);
    if (!row) throw new ApiError('Form not found', 404);

    const json = formsRepo.formToApi(row);
    if (!json.isPublished) {
      const ownerId = json.createdBy;
      const isOwnerAdmin =
        !!req.auth && req.auth.role === 'admin' && ownerId === req.auth.id;
      if (!isOwnerAdmin) throw new ApiError('Form not found', 404);
    }

    res.json(json);
  } catch (err) {
    next(err);
  }
}

export async function update(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.auth!;
    const { id } = req.params;
    const payload = req.body ?? {};
    const patch: Parameters<typeof formsRepo.updateForm>[2] = {};
    if (payload.title !== undefined) patch.title = payload.title;
    if (payload.description !== undefined)
      patch.description = payload.description;
    if (payload.isPublished !== undefined)
      patch.isPublished = payload.isPublished;
    if (payload.questions !== undefined) {
      const questions = normalizeQuestions(payload.questions);
      patch.questions = questions;
      patch.startQuestionId =
        payload.startQuestionId || questions[0]?.id;
    } else if (payload.startQuestionId !== undefined) {
      patch.startQuestionId = payload.startQuestionId;
    }

    const row = await formsRepo.updateForm(id, user.id, patch);
    if (!row) throw new ApiError('Form not found', 404);
    res.json(formsRepo.formToApi(row));
  } catch (err) {
    next(err);
  }
}

export async function remove(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.auth!;
    const { id } = req.params;
    const ok = await formsRepo.deleteForm(id, user.id);
    if (!ok) throw new ApiError('Form not found', 404);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function listResponses(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.auth || req.auth.role !== 'admin') {
      throw new ApiError('Admin access required', 403);
    }
    const { id } = req.params;

    const rows = await responsesRepo.listSubmittedForForm(id);
    const responses = rows.map((d) => {
      const base = responsesRepo.responseToApi(d);
      return {
        ...base,
        respondent: {
          ...base.respondent,
          name: base.respondent.name ?? d.user_name ?? undefined,
          email: base.respondent.email ?? d.user_email ?? undefined,
        },
      };
    });

    res.json(responses);
  } catch (err) {
    next(err);
  }
}

export async function exportCsv(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.auth || req.auth.role !== 'admin') {
      throw new ApiError('Admin access required', 403);
    }
    const { id } = req.params;

    const formRow = await formsRepo.findFormById(id);
    if (!formRow) throw new ApiError('Form not found', 404);

    const respRows = await responsesRepo.listSubmittedForFormCsv(id);
    const form = formsRepo.formToApi(formRow) as unknown as Form;
    const responses = respRows.map(
      (r) => responsesRepo.responseToApi(r) as unknown as FormResponse
    );

    const csv = responsesToCsv(form, responses);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="form_${id}_responses.csv"`
    );
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

function progressFor(form: Form, answers: Answer[]) {
  const total = form.questions.length || 1;
  const answered = Math.min(answers.length, total);
  return { total, answered, percent: Math.round((answered / total) * 100) };
}

export async function nextQuestion(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const row = await formsRepo.findFormById(id);
    if (!row) throw new ApiError('Form not found', 404);

    const json = formsRepo.formToApi(row) as unknown as Form;
    if (!json.isPublished) {
      const ownerId = json.createdBy;
      const isOwnerAdmin =
        !!req.auth && req.auth.role === 'admin' && ownerId === req.auth.id;
      if (!isOwnerAdmin) throw new ApiError('Form not found', 404);
    }

    let answers: Answer[] = [];
    if (req.method === 'POST') {
      const body = (req.body ?? {}) as { answers?: Answer[] };
      answers = Array.isArray(body.answers) ? body.answers : [];
    } else {
      const raw =
        typeof req.query.answers === 'string' ? req.query.answers : null;
      if (raw) {
        try {
          answers = JSON.parse(raw);
        } catch {
          answers = [];
        }
      }
    }

    const result = resolveNextQuestion(json, answers);
    res.json({
      done: result.done,
      question: result.question,
      progress: progressFor(json, answers),
    });
  } catch (err) {
    next(err);
  }
}
