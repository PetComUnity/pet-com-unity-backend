export interface Vet {
  id: string;
  ownerId: string;
  name: string;
  clinicName: string;
  email: string;
  phone?: string;
  address?: string;
  specialization?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVetInput {
  ownerId: string;
  name: string;
  clinicName: string;
  email: string;
  phone?: string;
  address?: string;
  specialization?: string;
}

export type UpdateVetInput = Partial<Omit<CreateVetInput, 'ownerId'>>;
