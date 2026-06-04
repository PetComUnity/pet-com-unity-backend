export type PetGender = 'male' | 'female' | 'unknown';
export type PetVerificationStatus = 'unverified' | 'verified';
export type PetSize = 'S' | 'M' | 'L';

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  weight?: number;
  location?: string;
  gender?: PetGender;
  birthDate?: Date;
  color?: string;
  description?: string;
  imageUrl?: string;
  imageFileId?: string;
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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedPets {
  items: Pet[];
  pagination: PaginationMeta;
}

export interface CreatePetInput {
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  weight?: number;
  location?: string;
  gender?: PetGender;
  birthDate?: string;
  color?: string;
  description?: string;
  imageUrl?: string;
  imageFileId?: string;
  microchipId?: string;
  isLost?: boolean;
  isAdoptable?: boolean;
}

export interface PetFilters {
  isAdoptable?: boolean;
  size?: PetSize;
  location?: string;
  species?: string;
  page?: number;
  limit?: number;
}

export type UpdatePetInput = Partial<Omit<CreatePetInput, 'ownerId'>>;
