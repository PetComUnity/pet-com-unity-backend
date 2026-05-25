import { randomUUID } from 'crypto';
import { PetModel } from '../models/pet.model';
import { CreatePetInput, PaginatedPets, Pet, PetFilters, UpdatePetInput } from '../types/pet';

function toPet(doc: any): Pet {
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

class PetsRepository {
  async getAll(filters: PetFilters = {}): Promise<PaginatedPets> {
    const query: { isAdoptable?: boolean } = {};
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 9;
    const skip = (page - 1) * limit;

    if (filters.isAdoptable !== undefined) {
      query.isAdoptable = filters.isAdoptable;
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
