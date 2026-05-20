import { sheltersRepository } from '../repositories/shelters.repository';
import { CreateShelterInput, Shelter } from '../types/shelter';
import { createAppError } from '../utils/api-response';

class SheltersService {
  async getAllShelters(): Promise<Shelter[]> {
    return sheltersRepository.getAll();
  }

  async getShelterById(id: string): Promise<Shelter> {
    const shelter = await sheltersRepository.getById(id);

    if (!shelter) {
      throw createAppError('Shelter not found', 404);
    }

    return shelter;
  }

  async createShelter(payload: CreateShelterInput): Promise<Shelter> {
    return sheltersRepository.create(payload);
  }
}

export const sheltersService = new SheltersService();
