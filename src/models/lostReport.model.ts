import { Document, Schema, model } from 'mongoose';

export type LostReportStatus = 'active' | 'resolved';

export interface ILostReport extends Document {
  petId: string;
  ownerId: string;
  city: string;
  lastSeenLocation?: string;
  dateLost?: string;
  message?: string;
  status: LostReportStatus;
}

const LostReportSchema = new Schema<ILostReport>(
  {
    petId: { type: String, required: true },
    ownerId: { type: String, required: true },
    city: { type: String, required: true },
    lastSeenLocation: { type: String },
    dateLost: { type: String },
    message: { type: String },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active',
    },
  },
  { timestamps: true },
);

export const LostReportModel = model<ILostReport>(
  'LostReport',
  LostReportSchema,
);
