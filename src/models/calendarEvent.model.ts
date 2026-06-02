import { Document, Schema, model } from 'mongoose';

export type CalendarEventType =
  | 'vaccination'
  | 'vet_visit'
  | 'checkup'
  | 'grooming'
  | 'medication'
  | 'other';

export interface ICalendarEvent extends Document {
  petId: string;
  ownerId: string;
  vetId?: string;
  title: string;
  date: Date;
  eventType: CalendarEventType;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    petId: { type: String, required: true },
    ownerId: { type: String, required: true },
    vetId: { type: String },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    eventType: {
      type: String,
      enum: ['vaccination', 'vet_visit', 'checkup', 'grooming', 'medication', 'other'],
      default: 'other',
    },
    description: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    location: { type: String },
  },
  { timestamps: true },
);

CalendarEventSchema.index({ ownerId: 1, date: 1 });
CalendarEventSchema.index({ petId: 1, date: 1 });

export const CalendarEventModel = model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
