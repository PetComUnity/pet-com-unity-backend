import { randomUUID } from 'crypto';

import { CreatePetInput, Pet, UpdatePetInput } from '../types/pet';

const initialTimestamp = new Date().toISOString();

// TODO: Replace this in-memory repository with Prisma/PostgreSQL or MongoDB persistence later.
let pets: Pet[] = [
  {
    id: 'pet-1',
    name: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 4,
    gender: 'male',
    description: 'Friendly family dog.',
    photoUrl: 'https://example.com/pets/max.jpg',
    ownerId: 'owner-1',
    status: 'owned',
    createdAt: initialTimestamp,
    updatedAt: initialTimestamp,
  },
];

class PetsRepository {
  getAll(): Pet[] {
    return [...pets];
  }

  getById(id: string): Pet | undefined {
    return pets.find((pet) => pet.id === id);
  }

  create(payload: CreatePetInput): Pet {
    const timestamp = new Date().toISOString();

    const newPet: Pet = {
      id: randomUUID(),
      ...payload,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    pets = [newPet, ...pets];

    return newPet;
  }

  update(id: string, payload: UpdatePetInput): Pet | undefined {
    const petIndex = pets.findIndex((pet) => pet.id === id);

    if (petIndex === -1) {
      return undefined;
    }

    const currentPet = pets[petIndex];

    const updatedPet: Pet = {
      ...currentPet,
      ...payload,
      id: currentPet.id,
      createdAt: currentPet.createdAt,
      updatedAt: new Date().toISOString(),
    };

    pets[petIndex] = updatedPet;

    return updatedPet;
  }

  delete(id: string): Pet | undefined {
    const petIndex = pets.findIndex((pet) => pet.id === id);

    if (petIndex === -1) {
      return undefined;
    }

    const [deletedPet] = pets.splice(petIndex, 1);

    return deletedPet;
  }
}

export const petsRepository = new PetsRepository();
