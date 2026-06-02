import { z } from 'zod';

const eventTypeEnum = z.enum([
  'vaccination',
  'vet_visit',
  'checkup',
  'grooming',
  'medication',
  'other',
]);

export const createCalendarEventSchema = z.object({
  petId: z.string().min(1, 'Pet ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  date: z.string().datetime({ message: 'Invalid date format' }),
  eventType: eventTypeEnum.optional().default('other'),
  description: z.string().max(500, 'Description is too long').optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().max(200).optional(),
  vetId: z.string().optional(),
});

export const updateCalendarEventSchema = createCalendarEventSchema
  .omit({ petId: true })
  .partial();

export const getCalendarEventsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  petId: z.string().optional(),
});

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;
export type GetCalendarEventsQuery = z.infer<typeof getCalendarEventsQuerySchema>;
