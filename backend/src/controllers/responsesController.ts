import type { Response, NextFunction } from 'express';
import * as formsRepo from '../repos/formsRepo';
import * as responsesRepo from '../repos/responsesRepo';
import { ApiError } from '../utils/ApiError';
import { validateResponse } from '../../../shared/validator';
import type { Answer, Form } from '../../../shared/types';
import type { AuthedRequest } from '../middleware/auth';

function mergeAnswers(existing: Answer[], incoming: Answer[]): Answer[] {
  const map = new Map<string, unknown>();
  for (const a of existing) map.set(a.questionId, a.value);
  for (const a of incoming) map.set(a.questionId, a.value);
  return [...map.entries()].map(([questionId, value]) => ({ questionId, value }));
}

export async function submit(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.auth;
    const body = req.body ?? {};
    const {
      formId,
      sessionId,
      email,
      answers = [],
      status = 'submitted',
    } = body;
    if (!formId) throw new ApiError('formId is required', 400);

    const formRow = await formsRepo.findFormById(String(formId));
    if (!formRow) throw new ApiError('Form not found', 404);
    const formJson = formsRepo.formToApi(formRow) as unknown as Form;

    if (!formJson.isPublished) {
      const ownerId = formJson.createdBy;
      const isOwnerAdmin =
        !!user && user.role === 'admin' && ownerId === user.id;
      if (!isOwnerAdmin) {
        throw new ApiError('Form is not accepting responses', 403);
      }
    }

    let row = await responsesRepo.findDraft(String(formId), {
      userId: user?.id,
      sessionId: user?.id ? undefined : sessionId ?? null,
    });

    if (!row) {
      row = await responsesRepo.insertDraft({
        formId: String(formId),
        userId: user?.id,
        sessionId: sessionId ?? null,
        name: user?.name,
        email: email || user?.email || null,
        answers: [],
      });
    }

    const merged = mergeAnswers(
      responsesRepo.responseToApi(row).answers as Answer[],
      answers as Answer[]
    );

    let respondentName = row.respondent_name ?? null;
    let respondentEmail = row.respondent_email ?? null;
    if (email) respondentEmail = email;
    if (user?.name && !respondentName) respondentName = user.name;
    if (user?.email && !respondentEmail) respondentEmail = user.email;

    let nextStatus: 'draft' | 'submitted' = 'draft';
    let submittedAt: Date | null = null;

    if (status === 'submitted') {
      const errors = validateResponse(formJson, merged);
      if (errors.length) {
        res.status(400).json({ message: 'Validation failed', errors });
        return;
      }
      nextStatus = 'submitted';
      submittedAt = new Date();
    }

    const updated = await responsesRepo.updateResponse({
      id: String(row.id),
      answers: merged,
      status: nextStatus,
      submittedAt,
      respondentName,
      respondentEmail,
    });

    if (!updated) throw new ApiError('Failed to save response', 500);
    res
      .status(nextStatus === 'submitted' ? 201 : 200)
      .json({
        status: nextStatus,
        response: responsesRepo.responseToApi(updated),
      });
  } catch (err) {
    next(err);
  }
}

export async function getDraft(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.auth;
    const formId =
      typeof req.query.formId === 'string' ? req.query.formId : null;
    const sessionId =
      typeof req.query.sessionId === 'string' ? req.query.sessionId : null;
    if (!formId) throw new ApiError('formId is required', 400);

    if (!user?.id && !sessionId) {
      res.json(null);
      return;
    }

    const row = await responsesRepo.findDraft(formId, {
      userId: user?.id,
      sessionId: user?.id ? undefined : sessionId ?? null,
    });

    res.json(row ? responsesRepo.responseToApi(row) : null);
  } catch (err) {
    next(err);
  }
}
