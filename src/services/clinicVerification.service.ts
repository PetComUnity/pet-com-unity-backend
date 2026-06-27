import { clinicVerificationRepository } from '../repositories/clinicVerification.repository';
import type {
  PetVerificationDecisionResponse,
  PetVerificationLookup,
  PetVerificationRecord,
  PetVerificationSummary,
} from '../types/clinicVerification';
import type { Pet } from '../types/pet';
import { createAppError } from '../utils/api-response';
import { isPublicSafeImageUrl } from '../utils/pet-serializer';
import type { SubmitPetVerificationInput } from '../validation/clinicVerification.schema';

function getPetMicrochipId(pet: Pet): string | undefined {
  return pet.microchipId;
}

function toVerificationLookup(pet: Pet): PetVerificationLookup {
  const lookup: PetVerificationLookup = {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    microchipId: getPetMicrochipId(pet) ?? '',
    verificationStatus: pet.verificationStatus,
  };

  if (pet.breed !== undefined) lookup.breed = pet.breed;
  if (pet.gender !== undefined) lookup.gender = pet.gender;
  if (pet.dateOfBirth ?? pet.birthDate) {
    lookup.dateOfBirth = pet.dateOfBirth ?? pet.birthDate;
  }
  if (pet.imageUrl && isPublicSafeImageUrl(pet.imageUrl)) {
    lookup.imageUrl = pet.imageUrl;
  }
  if (pet.passportNumber !== undefined) {
    lookup.passportNumber = pet.passportNumber;
  }
  if (pet.verifiedAt !== undefined) lookup.verifiedAt = pet.verifiedAt;
  if (pet.verifiedClinicName !== undefined) {
    lookup.verifiedClinicName = pet.verifiedClinicName;
  }

  return lookup;
}

function toVerificationSummary(pet: Pet): PetVerificationSummary {
  const summary: PetVerificationSummary = {
    id: pet.id,
    name: pet.name,
    microchipId: getPetMicrochipId(pet) ?? '',
    verificationStatus: pet.verificationStatus,
  };

  if (pet.passportNumber !== undefined) {
    summary.passportNumber = pet.passportNumber;
  }
  if (pet.verifiedBy !== undefined) summary.verifiedBy = pet.verifiedBy;
  if (pet.verifiedByName !== undefined) {
    summary.verifiedByName = pet.verifiedByName;
  }
  if (pet.verifiedClinicId !== undefined) {
    summary.verifiedClinicId = pet.verifiedClinicId;
  }
  if (pet.verifiedClinicName !== undefined) {
    summary.verifiedClinicName = pet.verifiedClinicName;
  }
  if (pet.verifiedAt !== undefined) summary.verifiedAt = pet.verifiedAt;
  if (pet.verificationNote !== undefined) {
    summary.verificationNote = pet.verificationNote;
  }

  return summary;
}

class ClinicVerificationService {
  async lookupPetByMicrochipId(
    microchipId: string,
  ): Promise<PetVerificationLookup> {
    const pet =
      await clinicVerificationRepository.findPetByMicrochipId(microchipId);

    if (!pet) {
      throw createAppError('Pet not found', 404);
    }

    return toVerificationLookup(pet);
  }

  async submitVerificationDecision(
    petId: string,
    verifierUserId: string,
    payload: SubmitPetVerificationInput,
  ): Promise<PetVerificationDecisionResponse> {
    const [pet, verifier, clinic] = await Promise.all([
      clinicVerificationRepository.getPetById(petId),
      clinicVerificationRepository.getVerifierUser(verifierUserId),
      clinicVerificationRepository.getClinicForUser(verifierUserId),
    ]);

    if (!pet) {
      throw createAppError('Pet not found', 404);
    }

    if (!verifier) {
      throw createAppError('Invalid authenticated user', 401);
    }

    const storedMicrochipId = getPetMicrochipId(pet);
    const providedMicrochipId = payload.microchipId.trim();
    const microchipMatched = storedMicrochipId === providedMicrochipId;

    if (payload.result === 'verified') {
      if (
        !payload.microchipMatched ||
        !payload.passportMatched ||
        !payload.visualCheckPassed
      ) {
        throw createAppError(
          'Verified result requires matching microchip, passport, and visual checks',
          400,
        );
      }

      if (!microchipMatched) {
        throw createAppError(
          'Microchip number does not match the pet profile',
          400,
        );
      }
    }

    const verifiedAt = new Date();
    const doctorId = payload.doctorId ?? verifier.id;
    const doctorName = payload.doctorName ?? verifier.name ?? null;
    const verificationRecord =
      await clinicVerificationRepository.createVerificationRecord({
        petId: pet.id,
        clinicId: clinic?.id ?? null,
        clinicName: clinic?.name ?? null,
        doctorId,
        doctorName,
        microchipId: providedMicrochipId,
        result: payload.result,
        microchipMatched,
        passportMatched: payload.passportMatched,
        visualCheckPassed: payload.visualCheckPassed,
        note: payload.note,
      });

    const updatedPet = await clinicVerificationRepository.updatePetVerification(
      pet.id,
      {
        verificationStatus: payload.result,
        verifiedBy: verifier.id,
        verifiedByName: doctorName,
        verifiedClinicId: clinic?.id ?? null,
        verifiedClinicName: clinic?.name ?? null,
        verifiedAt,
        verificationNote: payload.note ?? null,
        microchipId: storedMicrochipId,
      },
    );

    if (!updatedPet) {
      throw createAppError('Pet not found', 404);
    }

    return {
      pet: toVerificationSummary(updatedPet),
      verificationRecord,
    };
  }

  async getVerificationHistory(
    petId: string,
  ): Promise<PetVerificationRecord[]> {
    const pet = await clinicVerificationRepository.getPetById(petId);

    if (!pet) {
      throw createAppError('Pet not found', 404);
    }

    return clinicVerificationRepository.getVerificationHistory(petId);
  }
}

export const clinicVerificationService = new ClinicVerificationService();
