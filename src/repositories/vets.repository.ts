import { randomUUID } from 'crypto';

import { CreateVetInput, Vet } from '../types/vet';

const initialTimestamp = new Date().toISOString();

// TODO: Replace this in-memory repository with Prisma/PostgreSQL or MongoDB persistence later.
let vets: Vet[] = [
  {
    id: 'vet-1',
    name: 'Dr. Elena Petrova',
    clinicName: 'Pet Care Clinic',
    email: 'elena@petcareclinic.com',
    phone: '+38970222333',
    address: '5 Health Avenue, Skopje',
    specialization: 'Small animal medicine',
    createdAt: initialTimestamp,
    updatedAt: initialTimestamp,
  },
];

class VetsRepository {
  getAll(): Vet[] {
    return [...vets];
  }

  getById(id: string): Vet | undefined {
    return vets.find((vet) => vet.id === id);
  }

  create(payload: CreateVetInput): Vet {
    const timestamp = new Date().toISOString();

    const newVet: Vet = {
      id: randomUUID(),
      ...payload,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    vets = [newVet, ...vets];

    return newVet;
  }
}

export const vetsRepository = new VetsRepository();
