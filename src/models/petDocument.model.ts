import { Document, Schema, model } from 'mongoose';

export interface IPetDocument extends Document {
  petId: string;
  ownerId: string;
  name: string;
  issuedDate: string;
  fileId: string;
  mimeType?: string;
}

const PetDocumentSchema = new Schema<IPetDocument>(
  {
    petId: { type: String, required: true },
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    issuedDate: { type: String, required: true },
    fileId: { type: String, required: true },
    mimeType: { type: String },
  },
  { timestamps: true },
);

PetDocumentSchema.index({ petId: 1, ownerId: 1 });

export const PetDocumentModel = model<IPetDocument>('PetDocument', PetDocumentSchema);
