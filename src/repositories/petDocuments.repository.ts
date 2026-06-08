import { PetDocumentModel } from '../models/petDocument.model';
import type { AddPetDocumentInput } from '../validation/petDocument.schemas';

export interface PetDocument {
  id: string;
  petId: string;
  ownerId: string;
  name: string;
  issuedDate: string;
  fileId: string;
  createdAt?: Date;
}

function toDocument(doc: any): PetDocument {
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

class PetDocumentsRepository {
  async getByPetId(petId: string, ownerId: string): Promise<PetDocument[]> {
    const docs = await PetDocumentModel.find({ petId, ownerId }).sort({ createdAt: -1 }).lean();
    return docs.map(toDocument);
  }

  async getById(id: string): Promise<PetDocument | undefined> {
    const doc = await PetDocumentModel.findById(id).lean();
    if (!doc) return undefined;
    return toDocument(doc);
  }

  async create(petId: string, ownerId: string, payload: AddPetDocumentInput): Promise<PetDocument> {
    const doc = await PetDocumentModel.create({ ...payload, petId, ownerId });
    return toDocument(doc.toObject());
  }

  async delete(id: string): Promise<PetDocument | undefined> {
    const doc = await PetDocumentModel.findByIdAndDelete(id).lean();
    if (!doc) return undefined;
    return toDocument(doc);
  }
}

export const petDocumentsRepository = new PetDocumentsRepository();
