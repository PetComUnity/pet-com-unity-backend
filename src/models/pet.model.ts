import { Document, Schema, model } from 'mongoose';
import { generatePublicQrId, isValidPublicQrId } from '../utils/public-qr-id';

export type PetVerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'rejected';
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
  microchipNumber?: string;
  passportNumber?: string;
  isLost: boolean;
  isAdoptable: boolean;
  verificationStatus: PetVerificationStatus;
  verifiedBy?: string | null;
  verifiedByName?: string | null;
  verifiedClinicId?: string | null;
  verifiedClinicName?: string | null;
  verifiedAt?: Date | null;
  verificationNote?: string | null;
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
    microchipNumber: { type: String },
    passportNumber: { type: String },
    isLost: { type: Boolean, default: false },
    isAdoptable: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    verifiedBy: { type: String },
    verifiedByName: { type: String },
    verifiedClinicId: { type: String },
    verifiedClinicName: { type: String },
    verifiedAt: { type: Date },
    verificationNote: { type: String },
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

PetSchema.index({ microchipId: 1 });
PetSchema.index({ microchipNumber: 1 });

PetSchema.pre('validate', function setDefaultPublicQrId() {
  if (!this.publicQrId) {
    this.publicQrId = generatePublicQrId(this.name || 'pet');
  }
});

export const PetModel = model<IPet>('Pet', PetSchema);
