import { Router } from 'express';
import * as responsesController from '../controllers/responsesController';

export const responsesRouter = Router();

responsesRouter.post('/', responsesController.submit);
responsesRouter.get('/draft', responsesController.getDraft);
