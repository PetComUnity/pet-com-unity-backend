import type { PetGender, PetVerificationStatus } from './pet';

export type PetVerificationDecisionResult = 'verified' | 'pending' | 'rejected';

export interface PetVerificationLookup {
  id: string;
  name: string;
  species: string;
  breed?: string;
  gender?: PetGender;
  dateOfBirth?: string;
  imageUrl?: string;
  pictureUrl?: string;
  microchipId: string;
  passportNumber?: string;
  verificationStatus: PetVerificationStatus;
  verifiedAt?: Date | null;
  verifiedClinicName?: string | null;
}

export interface PetVerificationSummary {
  id: string;
  name: string;
  microchipId: string;
  passportNumber?: string;
  verificationStatus: PetVerificationStatus;
  verifiedBy?: string | null;
  verifiedByName?: string | null;
  verifiedClinicId?: string | null;
  verifiedClinicName?: string | null;
  verifiedAt?: Date | null;
  verificationNote?: string | null;
}

export interface PetVerificationRecord {
  id: string;
  petId: string;
  clinicId?: string | null;
  clinicName?: string | null;
  doctorId: string;
  doctorName?: string | null;
  microchipId: string;
  result: PetVerificationDecisionResult;
  microchipMatched: boolean;
  passportMatched: boolean;
  visualCheckPassed: boolean;
  note?: string;
  createdAt: Date;
}

export interface PetVerificationDecisionResponse {
  pet: PetVerificationSummary;
  verificationRecord: PetVerificationRecord;
}
