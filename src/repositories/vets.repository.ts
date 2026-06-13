import { VetModel } from '../models/vet.model';
import { CreateVetInput, UpdateVetInput, Vet } from '../types/vet';

function toVet(doc: any): Vet {
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

class VetsRepository {
  async getAll(): Promise<Vet[]> {
    const vets = await VetModel.find().lean();
    return vets.map(toVet);
  }

  async getById(id: string): Promise<Vet | undefined> {
    const vet = await VetModel.findById(id).lean();
    if (!vet) return undefined;
    return toVet(vet);
  }

  async create(payload: CreateVetInput): Promise<Vet> {
    const vet = await VetModel.create(payload);
    return toVet(vet.toObject());
  }

  async update(id: string, payload: UpdateVetInput): Promise<Vet | undefined> {
    const vet = await VetModel.findByIdAndUpdate(id, payload, {
      returnDocument: 'after',
    }).lean();
    if (!vet) return undefined;
    return toVet(vet);
  }
}

export const vetsRepository = new VetsRepository();
