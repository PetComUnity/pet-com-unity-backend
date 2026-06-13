import type { PetFilters, PetSize } from '../types/pet';

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getWeightRange(size: PetSize): { $gte: number; $lt?: number } {
  switch (size) {
    case 'S':
      return { $gte: 0, $lt: 10 };
    case 'M':
      return { $gte: 10, $lt: 25 };
    case 'L':
      return { $gte: 25 };
  }
}

export function buildPetQuery(
  filters: PetFilters = {},
  ownerId?: string,
): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  if (ownerId) {
    query.ownerId = ownerId;
  }

  if (filters.isAdoptable !== undefined) {
    query.isAdoptable = filters.isAdoptable;
  }

  if (filters.isLost !== undefined) {
    query.isLost = filters.isLost;
  }

  if (filters.size) {
    query.weight = getWeightRange(filters.size);
  }

  if (filters.location) {
    query.location = { $regex: escapeRegex(filters.location), $options: 'i' };
  }

  if (filters.species) {
    query.species = {
      $regex: `^${escapeRegex(filters.species)}$`,
      $options: 'i',
    };
  }

  return query;
}
