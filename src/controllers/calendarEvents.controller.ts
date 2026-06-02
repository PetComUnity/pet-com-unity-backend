import { AuthRequest } from '../middlewares/auth.middleware';
import { calendarEventsRepository } from '../repositories/calendarEvents.repository';
import { asyncHandler } from '../utils/async-handler';
import { createAppError, sendSuccess } from '../utils/api-response';
import {
  createCalendarEventSchema,
  getCalendarEventsQuerySchema,
  updateCalendarEventSchema,
} from '../validation/calendarEvent.schemas';

export const getCalendarEvents = asyncHandler(async (req: AuthRequest, res) => {
  const result = getCalendarEventsQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw createAppError(result.error.issues[0]?.message ?? 'Invalid query parameters', 400);
  }
  const events = await calendarEventsRepository.getByOwner(req.userId!, result.data);
  sendSuccess(res, 200, 'Calendar events fetched successfully', events);
});

export const createCalendarEvent = asyncHandler(async (req: AuthRequest, res) => {
  const result = createCalendarEventSchema.safeParse(req.body);
  if (!result.success) {
    throw createAppError(result.error.issues[0]?.message ?? 'Invalid request body', 400);
  }
  const event = await calendarEventsRepository.create(req.userId!, result.data);
  sendSuccess(res, 201, 'Calendar event created successfully', event);
});

export const updateCalendarEvent = asyncHandler(async (req: AuthRequest, res) => {
  const existing = await calendarEventsRepository.getById(req.params.id);
  if (!existing) throw createAppError('Event not found', 404);
  if (existing.ownerId !== req.userId) throw createAppError('Forbidden', 403);

  const result = updateCalendarEventSchema.safeParse(req.body);
  if (!result.success) {
    throw createAppError(result.error.issues[0]?.message ?? 'Invalid request body', 400);
  }
  const event = await calendarEventsRepository.update(req.params.id, result.data);
  sendSuccess(res, 200, 'Calendar event updated successfully', event);
});

export const deleteCalendarEvent = asyncHandler(async (req: AuthRequest, res) => {
  const existing = await calendarEventsRepository.getById(req.params.id);
  if (!existing) throw createAppError('Event not found', 404);
  if (existing.ownerId !== req.userId) throw createAppError('Forbidden', 403);

  const event = await calendarEventsRepository.delete(req.params.id);
  sendSuccess(res, 200, 'Calendar event deleted successfully', event);
});
