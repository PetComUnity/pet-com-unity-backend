import { petsRepository } from '../repositories/pets.repository';
import { CreatePetInput, PaginatedPets, Pet, PetFilters, UpdatePetInput } from '../types/pet';
import { createAppError } from '../utils/api-response';

class PetsService {
  async getAllPets(filters: PetFilters = {}): Promise<PaginatedPets> {
    return petsRepository.getAll(filters);
  }

  async getMyPets(ownerId: string, filters: PetFilters = {}): Promise<PaginatedPets> {
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

  async updatePet(id: string, payload: UpdatePetInput): Promise<Pet> {
    const pet = await petsRepository.update(id, payload);

    if (!pet) {
      throw createAppError('Pet not found', 404);
    }

    return pet;
  }

  async deletePet(id: string): Promise<Pet> {
    const pet = await petsRepository.delete(id);

    if (!pet) {
      throw createAppError('Pet not found', 404);
    }

    return pet;
  }
}

export const petsService = new PetsService();
