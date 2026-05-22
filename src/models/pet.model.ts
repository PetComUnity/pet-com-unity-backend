import { Document, Schema, model } from 'mongoose';

export type PetVerificationStatus = 'unverified' | 'verified';
export type PetGender = 'male' | 'female' | 'unknown';

export interface IPet extends Document {
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  location?: string;
  gender?: PetGender;
  birthDate?: string;
  color?: string;
  description?: string;
  imageUrl?: string;
  microchipId?: string;
  isLost: boolean;
  isAdoptable: boolean;
  verificationStatus: PetVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: Date | null;
  publicQrId: string;
}

const PetSchema = new Schema<IPet>(
  {
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: { type: String },
    location: { type: String },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
    },
    birthDate: { type: String },
    color: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    microchipId: { type: String },
    isLost: { type: Boolean, default: false },
    isAdoptable: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified'],
      default: 'unverified',
    },
    verifiedBy: { type: String },
    verifiedAt: { type: Date },
    publicQrId: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const PetModel = model<IPet>('Pet', PetSchema);
