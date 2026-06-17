import { petsRepository } from '../repositories/pets.repository';
import {
  CreatePetInput,
  PaginatedPets,
  Pet,
  PetFilters,
  PublicPetProfile,
  UpdatePetInput,
} from '../types/pet';
import { assertCanAccessOwnedResource } from '../utils/access-control';
import { createAppError } from '../utils/api-response';
import {
  generatePublicQrId,
  isValidPublicQrId,
} from '../utils/public-qr-id';
import { toPublicPetProfile } from '../utils/pet-serializer';

const PUBLIC_PROFILE_NOT_FOUND_MESSAGE = 'Public pet profile not found.';
const DUPLICATE_PUBLIC_QR_ID_MESSAGE = 'Public QR ID already exists';
const MAX_PUBLIC_QR_ID_GENERATION_ATTEMPTS = 5;

function isDuplicatePublicQrIdError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const mongoError = error as {
    code?: unknown;
    keyPattern?: Record<string, unknown>;
    keyValue?: Record<string, unknown>;
  };

  return (
    mongoError.code === 11000 &&
    (mongoError.keyPattern?.publicQrId === 1 ||
      Object.prototype.hasOwnProperty.call(
        mongoError.keyValue ?? {},
        'publicQrId',
      ))
  );
}

class PetsService {
  async getAllPets(filters: PetFilters = {}): Promise<PaginatedPets> {
    return petsRepository.getAll(filters);
  }

  async getMyPets(
    ownerId: string,
    filters: PetFilters = {},
  ): Promise<PaginatedPets> {
    return petsRepository.getByOwnerId(ownerId, filters);
  }

  async getPetById(id: string): Promise<Pet> {
    const pet = await petsRepository.getById(id);

    if (!pet) {
      throw createAppError('Pet not found', 404);
    }

    return pet;
  }

  async getPublicPetProfile(publicQrId: string): Promise<PublicPetProfile> {
    if (!isValidPublicQrId(publicQrId)) {
      throw createAppError(PUBLIC_PROFILE_NOT_FOUND_MESSAGE, 404);
    }

    const pet = await petsRepository.findByPublicQrId(publicQrId);

    if (!pet) {
      throw createAppError(PUBLIC_PROFILE_NOT_FOUND_MESSAGE, 404);
    }

    return toPublicPetProfile(pet);
  }

  async createPet(payload: CreatePetInput): Promise<Pet> {
    const hasProvidedPublicQrId = payload.publicQrId !== undefined;
    const attempts = hasProvidedPublicQrId
      ? 1
      : MAX_PUBLIC_QR_ID_GENERATION_ATTEMPTS;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const publicQrId =
        payload.publicQrId ?? generatePublicQrId(payload.name);

      const existing = await petsRepository.findByPublicQrId(publicQrId);
      if (existing) {
        if (hasProvidedPublicQrId) {
          throw createAppError(DUPLICATE_PUBLIC_QR_ID_MESSAGE, 409);
        }

        continue;
      }

      try {
        return await petsRepository.create({
          ...payload,
          publicQrId,
        });
      } catch (error) {
        if (isDuplicatePublicQrIdError(error)) {
          if (hasProvidedPublicQrId) {
            throw createAppError(DUPLICATE_PUBLIC_QR_ID_MESSAGE, 409);
          }

          continue;
        }

        throw error;
      }
    }

    throw createAppError('Could not generate a unique public QR ID');
  }

  async updatePet(
    id: string,
    userId: string,
    payload: UpdatePetInput,
  ): Promise<Pet> {
    const existing = await petsRepository.getById(id);

    if (!existing) {
      throw createAppError('Pet not found', 404);
    }

    assertCanAccessOwnedResource(existing.ownerId, userId);

    if (payload.publicQrId !== undefined) {
      const existingWithPublicQrId = await petsRepository.findByPublicQrId(
        payload.publicQrId,
      );

      if (existingWithPublicQrId && existingWithPublicQrId.id !== id) {
        throw createAppError(DUPLICATE_PUBLIC_QR_ID_MESSAGE, 409);
      }
    }

    let pet: Pet | undefined;
    try {
      pet = await petsRepository.update(id, payload);
    } catch (error) {
      if (isDuplicatePublicQrIdError(error)) {
        throw createAppError(DUPLICATE_PUBLIC_QR_ID_MESSAGE, 409);
      }

      throw error;
    }

    if (!pet) {
      throw createAppError('Pet not found', 404);
    }

    return pet;
  }

  async deletePet(id: string, userId: string): Promise<Pet> {
    const existing = await petsRepository.getById(id);

    if (!existing) {
      throw createAppError('Pet not found', 404);
    }

    assertCanAccessOwnedResource(existing.ownerId, userId);

    const pet = await petsRepository.delete(id);

    if (!pet) {
      throw createAppError('Pet not found', 404);
    }

    return pet;
  }
}

export const petsService = new PetsService();
