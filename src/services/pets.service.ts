import { petsRepository } from '../repositories/pets.repository';
import { CreatePetInput, Pet, UpdatePetInput } from '../types/pet';
import { createAppError } from '../utils/api-response';

class PetsService {
  async getAllPets(): Promise<Pet[]> {
    return petsRepository.getAll();
  }

  async getPetById(id: string): Promise<Pet> {
    const pet = petsRepository.getById(id);

    if (!pet) {
      throw createAppError('Pet not found', 404);
    }

    return pet;
  }

  async createPet(payload: CreatePetInput): Promise<Pet> {
    return petsRepository.create(payload);
  }

  async updatePet(id: string, payload: UpdatePetInput): Promise<Pet> {
    const pet = petsRepository.update(id, payload);

    if (!pet) {
      throw createAppError('Pet not found', 404);
    }

    return pet;
  }

  async deletePet(id: string): Promise<Pet> {
    const pet = petsRepository.delete(id);

    if (!pet) {
      throw createAppError('Pet not found', 404);
    }

    return pet;
  }
}

export const petsService = new PetsService();
