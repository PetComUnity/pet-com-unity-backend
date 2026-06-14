import { Schema, model, models } from "mongoose";

const WorkingHoursSchema = new Schema(
{
start: {
type: String,
default: null,
},


end: {
  type: String,
  default: null,
},


},
{
_id: false,
}
);

const StaffSchema = new Schema(
{
/**
* Clinic relation
*/
clinicId: {
type: Schema.Types.ObjectId,
ref: "Clinic",
required: true,
index: true,
},


/**
 * Personal Information
 */
name: {
  type: String,
  required: true,
  trim: true,
},

email: {
  type: String,
  required: true,
  trim: true,
  lowercase: true,
},

phoneNumber: {
  type: String,
  required: true,
  trim: true,
},

dateOfBirth: {
  type: Date,
  required: true,
},

/**
 * Employment
 */
available: {
  type: Boolean,
  default: true,
},

emergencyAvailability: {
  type: Boolean,
  default: false,
},

/**
 * Single position
 */
position: {
  type: String,
  required: true,
  trim: true,
},

/**
 * Working days
 */
workingDays: {
  type: [
    {
      type: String,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
    },
  ],
  default: [],
},

/**
 * Working hours
 */
workingHours: {
  type: WorkingHoursSchema,
  default: () => ({
    start: null,
    end: null,
  }),
},

/**
 * Education
 */
educationDegree: {
  type: String,
  required: true,
  trim: true,
},

university: {
  type: String,
  required: true,
  trim: true,
},

graduationYear: {
  type: Number,
  required: true,
},

degreeCertificate: {
  type: String,
  default: null,
},

/**
 * Veterinary License
 */
veterinaryLicenseNumber: {
  type: String,
  required: true,
  trim: true,
},

licenseIssuingAuthority: {
  type: String,
  required: true,
  trim: true,
},

validFrom: {
  type: Date,
  required: true,
},

/**
 * Documents
 */
documents: {
  governmentIdScan: {
    type: String,
    default: null,
  },

  licenceScan: {
    type: String,
    default: null,
  },
},


},
{
timestamps: true,
}
);

export const Staff =
models.Staff || model("Staff", StaffSchema);
