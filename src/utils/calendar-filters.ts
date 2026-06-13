import type { GetCalendarEventsQuery } from '../validation/calendarEvent.schemas';

export function buildCalendarDateFilter(
  filters: GetCalendarEventsQuery = {},
): { $gte: Date; $lt: Date } | undefined {
  if (filters.month !== undefined && filters.year !== undefined) {
    return {
      $gte: new Date(filters.year, filters.month - 1, 1),
      $lt: new Date(filters.year, filters.month, 1),
    };
  }

  if (filters.year !== undefined) {
    return {
      $gte: new Date(filters.year, 0, 1),
      $lt: new Date(filters.year + 1, 0, 1),
    };
  }

  return undefined;
}
