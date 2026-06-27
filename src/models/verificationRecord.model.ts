import { Document, Schema, model } from 'mongoose';
import type { PetVerificationDecisionResult } from '../types/clinicVerification';

export interface IVerificationRecord extends Document {
  petId: string;
  clinicId?: string | null;
  clinicName?: string | null;
  doctorId: string;
  doctorName?: string | null;
  microchipId: string;
  result: PetVerificationDecisionResult;
  microchipMatched: boolean;
  passportMatched: boolean;
  visualCheckPassed: boolean;
  note?: string;
  createdAt: Date;
}

const VerificationRecordSchema = new Schema<IVerificationRecord>(
  {
    petId: { type: String, required: true, index: true },
    clinicId: { type: String },
    clinicName: { type: String },
    doctorId: { type: String, required: true },
    doctorName: { type: String },
    microchipId: { type: String, required: true },
    result: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      required: true,
    },
    microchipMatched: { type: Boolean, required: true },
    passportMatched: { type: Boolean, required: true },
    visualCheckPassed: { type: Boolean, required: true },
    note: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

VerificationRecordSchema.index({ petId: 1, createdAt: -1 });

export const VerificationRecordModel = model<IVerificationRecord>(
  'VerificationRecord',
  VerificationRecordSchema,
);
