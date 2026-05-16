import { randomUUID } from 'crypto';

import { CreateShelterInput, Shelter } from '../types/shelter';

const initialTimestamp = new Date().toISOString();

// TODO: Replace this in-memory repository with Prisma/PostgreSQL or MongoDB persistence later.
let shelters: Shelter[] = [
  {
    id: 'shelter-1',
    name: 'Happy Paws Shelter',
    email: 'contact@happypaws.org',
    phone: '+38970111222',
    address: '12 Rescue Street, Skopje',
    description: 'Local shelter caring for abandoned pets.',
    createdAt: initialTimestamp,
    updatedAt: initialTimestamp,
  },
];

class SheltersRepository {
  getAll(): Shelter[] {
    return [...shelters];
  }

  getById(id: string): Shelter | undefined {
    return shelters.find((shelter) => shelter.id === id);
  }

  create(payload: CreateShelterInput): Shelter {
    const timestamp = new Date().toISOString();

    const newShelter: Shelter = {
      id: randomUUID(),
      ...payload,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    shelters = [newShelter, ...shelters];

    return newShelter;
  }
}

export const sheltersRepository = new SheltersRepository();
