export type PetGender = 'male' | 'female' | 'unknown';
export type PetVerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'rejected';
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
  birthDate?: string;
  dateOfBirth?: string;
  color?: string;
  themeColor?: string;
  description?: string;
  imageUrl?: string;
  imageFileId?: string;
  microchipId?: string;
  passportNumber?: string;
  isLost: boolean;
  isAdoptable: boolean;
  verificationStatus: PetVerificationStatus;
  verifiedBy?: string | null;
  verifiedByName?: string | null;
  verifiedClinicId?: string | null;
  verifiedClinicName?: string | null;
  verifiedAt?: Date | null;
  verificationNote?: string | null;
  publicQrId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicPetProfile {
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  dateOfBirth?: string;
  color?: string;
  gender?: PetGender;
  description?: string;
  imageUrl?: string;
  isLost: boolean;
  isAdoptable: boolean;
  verificationStatus: PetVerificationStatus;
  publicQrId: string;
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
  dateOfBirth?: string;
  color?: string;
  themeColor?: string;
  description?: string;
  imageUrl?: string;
  imageFileId?: string;
  microchipId?: string;
  passportNumber?: string;
  isLost?: boolean;
  isAdoptable?: boolean;
  publicQrId?: string;
}

export interface PetFilters {
  isAdoptable?: boolean;
  isLost?: boolean;
  size?: PetSize;
  location?: string;
  species?: string;
  page?: number;
  limit?: number;
}

export type UpdatePetInput = Partial<Omit<CreatePetInput, 'ownerId'>>;
