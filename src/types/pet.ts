export type PetGender = 'male' | 'female' | 'unknown';
export type PetStatus = 'owned' | 'lost' | 'found' | 'adoption';

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: PetGender;
  description: string;
  photoUrl: string;
  ownerId: string;
  status: PetStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetInput {
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: PetGender;
  description: string;
  photoUrl: string;
  ownerId: string;
  status: PetStatus;
}

export type UpdatePetInput = CreatePetInput;
