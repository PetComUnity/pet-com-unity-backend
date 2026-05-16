export interface Vet {
  id: string;
  name: string;
  clinicName: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVetInput {
  name: string;
  clinicName: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
}
