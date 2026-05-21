import { ShelterModel } from '../models/shelter.model';
import {
  CreateShelterInput,
  Shelter,
  UpdateShelterInput,
} from '../types/shelter';

function toShelter(doc: any): Shelter {
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

class SheltersRepository {
  async getAll(): Promise<Shelter[]> {
    const shelters = await ShelterModel.find().lean();
    return shelters.map(toShelter);
  }

  async getById(id: string): Promise<Shelter | undefined> {
    const shelter = await ShelterModel.findById(id).lean();
    if (!shelter) return undefined;
    return toShelter(shelter);
  }

  async create(payload: CreateShelterInput): Promise<Shelter> {
    const shelter = await ShelterModel.create(payload);
    return toShelter(shelter.toObject());
  }

  async update(
    id: string,
    payload: UpdateShelterInput,
  ): Promise<Shelter | undefined> {
    const shelter = await ShelterModel.findByIdAndUpdate(id, payload, {
      new: true,
    }).lean();
    if (!shelter) return undefined;
    return toShelter(shelter);
  }
}

export const sheltersRepository = new SheltersRepository();
