import { Router } from 'express';
import * as formsController from '../controllers/formsController';
import { requireAdmin } from '../middleware/auth';

export const formsRouter = Router();

formsRouter.get('/', formsController.list);
formsRouter.post('/', requireAdmin, formsController.create);

formsRouter.get('/:id', formsController.getOne);
formsRouter.put('/:id', requireAdmin, formsController.update);
formsRouter.delete('/:id', requireAdmin, formsController.remove);

formsRouter.get('/:id/responses', formsController.listResponses);
formsRouter.get('/:id/export', formsController.exportCsv);

formsRouter.get('/:id/next', formsController.nextQuestion);
formsRouter.post('/:id/next', formsController.nextQuestion);
