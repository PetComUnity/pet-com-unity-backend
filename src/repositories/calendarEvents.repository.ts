import {
  CalendarEventModel,
  ICalendarEvent,
} from '../models/calendarEvent.model';
import {
  CreateCalendarEventInput,
  GetCalendarEventsQuery,
  UpdateCalendarEventInput,
} from '../validation/calendarEvent.schemas';
import { buildCalendarDateFilter } from '../utils/calendar-filters';

export interface CalendarEvent {
  id: string;
  petId: string;
  ownerId: string;
  vetId?: string;
  title: string;
  date: string;
  eventType: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

function toCalendarEvent(doc: any): CalendarEvent {
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

class CalendarEventsRepository {
  async getByOwner(
    ownerId: string,
    filters: GetCalendarEventsQuery = {},
  ): Promise<CalendarEvent[]> {
    const query: Record<string, unknown> = { ownerId };

    const dateFilter = buildCalendarDateFilter(filters);
    if (dateFilter) query.date = dateFilter;

    if (filters.petId) {
      query.petId = filters.petId;
    }

    const events = await CalendarEventModel.find(query)
      .sort({ date: 1 })
      .lean();
    return events.map(toCalendarEvent);
  }

  async getById(id: string): Promise<CalendarEvent | undefined> {
    const event = await CalendarEventModel.findById(id).lean();
    if (!event) return undefined;
    return toCalendarEvent(event);
  }

  async create(
    ownerId: string,
    payload: CreateCalendarEventInput,
  ): Promise<CalendarEvent> {
    const event = await CalendarEventModel.create({
      ...payload,
      ownerId,
      date: new Date(payload.date),
    });
    return toCalendarEvent(event.toObject());
  }

  async update(
    id: string,
    payload: UpdateCalendarEventInput,
  ): Promise<CalendarEvent | undefined> {
    const updateData: Record<string, unknown> = { ...payload };
    if (payload.date) {
      updateData.date = new Date(payload.date);
    }
    const event = await CalendarEventModel.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
    }).lean();
    if (!event) return undefined;
    return toCalendarEvent(event);
  }

  async delete(id: string): Promise<CalendarEvent | undefined> {
    const event = await CalendarEventModel.findByIdAndDelete(id).lean();
    if (!event) return undefined;
    return toCalendarEvent(event);
  }
}

export const calendarEventsRepository = new CalendarEventsRepository();
