import { randomUUID } from 'crypto';
import { PetModel } from '../models/pet.model';
import { CreatePetInput, PaginatedPets, Pet, PetFilters, PetSize, UpdatePetInput } from '../types/pet';

function toPet(doc: any): Pet {
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getWeightRange(size: PetSize): { $gte: number; $lt?: number } {
  switch (size) {
    case 'S':
      return { $gte: 0, $lt: 10 };
    case 'M':
      return { $gte: 10, $lt: 25 };
    case 'L':
      return { $gte: 25 };
  }
}

class PetsRepository {
  async getAll(filters: PetFilters = {}): Promise<PaginatedPets> {
    const query: Record<string, unknown> = {};
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 9;
    const skip = (page - 1) * limit;

    if (filters.isAdoptable !== undefined) {
      query.isAdoptable = filters.isAdoptable;
    }

    if (filters.size) {
      query.weight = getWeightRange(filters.size);
    }

    if (filters.location) {
      query.location = { $regex: escapeRegex(filters.location), $options: 'i' };
    }

    if (filters.species) {
      query.species = { $regex: `^${escapeRegex(filters.species)}$`, $options: 'i' };
    }

    const [pets, total] = await Promise.all([
      PetModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      PetModel.countDocuments(query),
    ]);

    return {
      items: pets.map(toPet),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getById(id: string): Promise<Pet | undefined> {
    const pet = await PetModel.findById(id).lean();
    if (!pet) return undefined;
    return toPet(pet);
  }

  async create(payload: CreatePetInput): Promise<Pet> {
    const pet = await PetModel.create({
      ...payload,
      publicQrId: randomUUID(),
      isLost: payload.isLost ?? false,
      isAdoptable: payload.isAdoptable ?? false,
      verificationStatus: 'unverified',
    });
    return toPet(pet.toObject());
  }

  async update(id: string, payload: UpdatePetInput): Promise<Pet | undefined> {
    const pet = await PetModel.findByIdAndUpdate(id, payload, {
      new: true,
    }).lean();
    if (!pet) return undefined;
    return toPet(pet);
  }

  async delete(id: string): Promise<Pet | undefined> {
    const pet = await PetModel.findByIdAndDelete(id).lean();
    if (!pet) return undefined;
    return toPet(pet);
  }
}

export const petsRepository = new PetsRepository();
