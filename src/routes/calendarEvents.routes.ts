import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
} from '../controllers/calendarEvents.controller';

const router = Router();

router.get('/', authMiddleware, getCalendarEvents);
router.post('/', authMiddleware, createCalendarEvent);
router.put('/:id', authMiddleware, updateCalendarEvent);
router.delete('/:id', authMiddleware, deleteCalendarEvent);

export default router;
