import express, { RequestHandler } from 'express';
import { createEventFromChat } from '../controllers/chatEventController';

const router = express.Router();

router.post('/events/chat', createEventFromChat as RequestHandler);

export default router; 