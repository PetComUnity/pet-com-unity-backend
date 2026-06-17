import { petsRepository } from '../repositories/pets.repository';
import {
  CreatePetInput,
  PaginatedPets,
  Pet,
  PetFilters,
  UpdatePetInput,
} from '../types/pet';
import { assertCanAccessOwnedResource } from '../utils/access-control';
import { createAppError } from '../utils/api-response';
import { deleteCloudinaryAsset } from '../utils/cloudinary';

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

  async createPet(payload: CreatePetInput): Promise<Pet> {
    return petsRepository.create(payload);
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

    const pet = await petsRepository.update(id, payload);

    if (!pet) {
      throw createAppError('Pet not found', 404);
    }

    const imageIsChanging = 'imageFileId' in payload || 'imageUrl' in payload;
    if (imageIsChanging) {
      if (existing.imageFileId && existing.imageFileId !== payload.imageFileId) {
        void deleteCloudinaryAsset(existing.imageFileId);
      }
      if (existing.imageUrl && existing.imageUrl !== payload.imageUrl) {
        void deleteCloudinaryAsset(existing.imageUrl);
      }
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

    if (existing.imageFileId) void deleteCloudinaryAsset(existing.imageFileId);
    if (existing.imageUrl) void deleteCloudinaryAsset(existing.imageUrl);

    return pet;
  }
}

export const petsService = new PetsService();
