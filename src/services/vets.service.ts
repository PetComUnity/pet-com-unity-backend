import { vetsRepository } from '../repositories/vets.repository';
import { CreateVetInput, Vet } from '../types/vet';
import { createAppError } from '../utils/api-response';

class VetsService {
  async getAllVets(): Promise<Vet[]> {
    return vetsRepository.getAll();
  }

  async getVetById(id: string): Promise<Vet> {
    const vet = await vetsRepository.getById(id);

    if (!vet) {
      throw createAppError('Vet not found', 404);
    }

    return vet;
  }

  async createVet(payload: CreateVetInput): Promise<Vet> {
    return vetsRepository.create(payload);
  }
}

export const vetsService = new VetsService();
