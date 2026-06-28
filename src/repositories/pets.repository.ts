import { PetModel } from '../models/pet.model';
import {
  CreatePetInput,
  PaginatedPets,
  Pet,
  PetFilters,
  UpdatePetInput,
} from '../types/pet';
import { buildPetQuery } from '../utils/pet-filters';

function toPet(doc: any): Pet {
  const { _id, __v, microchipNumber, ...rest } = doc;
  const microchipId = rest.microchipId ?? microchipNumber;
  const birthDate = rest.birthDate ?? rest.dateOfBirth;
  const dateOfBirth = rest.dateOfBirth ?? rest.birthDate;

  return {
    ...rest,
    microchipId,
    birthDate,
    dateOfBirth,
    id: _id.toString(),
  };
}

function normalizePetIdentityPayload(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = { ...payload };
  const microchipId = normalized.microchipId ?? normalized.microchipNumber;
  const dateOfBirth = normalized.dateOfBirth ?? normalized.birthDate;

  if (microchipId !== undefined) {
    normalized.microchipId = microchipId;
  }

  if (dateOfBirth !== undefined) {
    normalized.dateOfBirth = dateOfBirth;
    normalized.birthDate = dateOfBirth;
  }

  return normalized;
}

class PetsRepository {
  async getAll(filters: PetFilters = {}): Promise<PaginatedPets> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 9;
    const query = buildPetQuery(filters);

    return this.getPaginatedPets(query, page, limit);
  }

  async getByOwnerId(
    ownerId: string,
    filters: PetFilters = {},
  ): Promise<PaginatedPets> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 9;
    const query = buildPetQuery(filters, ownerId);

    return this.getPaginatedPets(query, page, limit);
  }

  private async getPaginatedPets(
    query: Record<string, unknown>,
    page: number,
    limit: number,
  ): Promise<PaginatedPets> {
    const skip = (page - 1) * limit;
    const [pets, total] = await Promise.all([
      PetModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
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

  async findByPublicQrId(publicQrId: string): Promise<Pet | undefined> {
    const pet = await PetModel.findOne({ publicQrId }).lean();
    if (!pet) return undefined;
    return toPet(pet);
  }

  async create(payload: CreatePetInput): Promise<Pet> {
    const normalizedPayload = normalizePetIdentityPayload(
      payload as unknown as Record<string, unknown>,
    );
    const pet = await PetModel.create({
      ...normalizedPayload,
      isLost: payload.isLost ?? false,
      isAdoptable: payload.isAdoptable ?? false,
      verificationStatus: 'unverified',
    });
    return toPet(pet.toObject());
  }

  async update(id: string, payload: UpdatePetInput): Promise<Pet | undefined> {
    const normalizedPayload = normalizePetIdentityPayload(
      payload as unknown as Record<string, unknown>,
    );
    const pet = await PetModel.findByIdAndUpdate(id, normalizedPayload, {
      returnDocument: 'after',
      runValidators: true,
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
