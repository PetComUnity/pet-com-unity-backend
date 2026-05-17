import { Document, Schema, model } from 'mongoose';

export interface IShelter extends Document {
  ownerId: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  description?: string;
}

const ShelterSchema = new Schema<IShelter>(
  {
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true },
);

export const ShelterModel = model<IShelter>('Shelter', ShelterSchema);
