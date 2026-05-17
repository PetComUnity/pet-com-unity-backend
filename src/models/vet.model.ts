import { Document, Schema, model } from 'mongoose';

export interface IVet extends Document {
  ownerId: string;
  name: string;
  clinicName: string;
  email: string;
  phone?: string;
  address?: string;
  specialization?: string;
}

const VetSchema = new Schema<IVet>(
  {
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    clinicName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    specialization: { type: String },
  },
  { timestamps: true },
);

export const VetModel = model<IVet>('Vet', VetSchema);
