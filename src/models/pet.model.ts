import { Document, Schema, model } from 'mongoose';
import {
  generatePublicQrId,
  isValidPublicQrId,
} from '../utils/public-qr-id';

export type PetVerificationStatus = 'unverified' | 'verified';
export type PetGender = 'male' | 'female' | 'unknown';

export interface IPet extends Document {
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  weight?: number;
  location?: string;
  gender?: PetGender;
  birthDate?: string;
  color?: string;
  themeColor?: string;
  description?: string;
  imageUrl?: string;
  imageFileId?: string;
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
    weight: { type: Number, min: 0 },
    location: { type: String },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
    },
    birthDate: { type: String },
    color: { type: String },
    themeColor: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    imageFileId: { type: String },
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
    publicQrId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: isValidPublicQrId,
        message: 'Invalid public QR ID',
      },
    },
  },
  { timestamps: true },
);

PetSchema.pre('validate', function setDefaultPublicQrId() {
  if (!this.publicQrId) {
    this.publicQrId = generatePublicQrId(this.name || 'pet');
  }
});

export const PetModel = model<IPet>('Pet', PetSchema);
