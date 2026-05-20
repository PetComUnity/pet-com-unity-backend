export interface Shelter {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShelterInput {
  ownerId: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  description?: string;
}

export type UpdateShelterInput = Partial<Omit<CreateShelterInput, 'ownerId'>>;
