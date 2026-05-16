export interface Shelter {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShelterInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
}
