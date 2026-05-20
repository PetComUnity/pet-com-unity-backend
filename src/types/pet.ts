export type PetGender = 'male' | 'female' | 'unknown';
export type PetVerificationStatus = 'unverified' | 'pending' | 'verified';

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  gender?: PetGender;
  birthDate?: Date;
  color?: string;
  description?: string;
  imageUrl?: string;
  microchipId?: string;
  isLost: boolean;
  isAdoptable: boolean;
  verificationStatus: PetVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  publicQrId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePetInput {
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  gender?: PetGender;
  birthDate?: string;
  color?: string;
  description?: string;
  imageUrl?: string;
  microchipId?: string;
  isLost?: boolean;
  isAdoptable?: boolean;
}

export type UpdatePetInput = Partial<Omit<CreatePetInput, 'ownerId'>>;
