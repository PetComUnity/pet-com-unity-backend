import { Schema, model, models } from "mongoose";

const SocialLinkSchema = new Schema(
  {
    platform: String,
    url: String,
  },
  { _id: false }
);

const DayWorkingHoursSchema = new Schema(
  {
    start: { type: String, default: null },
    end: { type: String, default: null },
  },
  { _id: false }
);

const WorkingHoursSchema = new Schema(
  {
    monday: { type: DayWorkingHoursSchema, default: () => ({ start: null, end: null }) },
    tuesday: { type: DayWorkingHoursSchema, default: () => ({ start: null, end: null }) },
    wednesday: { type: DayWorkingHoursSchema, default: () => ({ start: null, end: null }) },
    thursday: { type: DayWorkingHoursSchema, default: () => ({ start: null, end: null }) },
    friday: { type: DayWorkingHoursSchema, default: () => ({ start: null, end: null }) },
    saturday: { type: DayWorkingHoursSchema, default: () => ({ start: null, end: null }) },
    sunday: { type: DayWorkingHoursSchema, default: () => ({ start: null, end: null }) },
  },
  { _id: false }
);

const ShelterSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      default: null,
    },
    
    phoneNumbers: {
      type: [String],
      default: [],
    },
    website: {
      type: String,
      default: null,
    },

    registrationNumber: {
      type: String,
      default: null,
      sparse: true,
      trim: true,
    },

    location: {
      type: String,
      default: null,
    },

    workingHours: {
      type: WorkingHoursSchema,
      default: () => ({
        monday: { start: null, end: null },
        tuesday: { start: null, end: null },
        wednesday: { start: null, end: null },
        thursday: { start: null, end: null },
        friday: { start: null, end: null },
        saturday: { start: null, end: null },
        sunday: { start: null, end: null },
      }),
    },

    socialMediaLinks: {
      type: [SocialLinkSchema],
      default: [],
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Shelter =
  models.Shelter ||
  model("Shelter", ShelterSchema);

export const ShelterModel = Shelter;
