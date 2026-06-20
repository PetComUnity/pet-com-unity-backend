import { Staff } from "../models/staff.model";
import { Clinic } from "../models/clinic.model";

class StaffService {
  /**
   * Get all staff for a clinic (by clinicId)
   */
  async getStaffByClinic(clinicId: string) {
    return Staff.find({ clinicId }).sort({ createdAt: -1 });
  }

  /**
   * Get staff by ID
   */
  async getStaffById(id: string) {
    return Staff.findById(id);
  }

  /**
   * Get staff for logged-in vet (via userId → clinic)
   */
  async getStaffByUserId(userId: string) {
    const clinic = await Clinic.findOne({ userId });

    if (!clinic) {
      return [];
    }

    return Staff.find({ clinicId: clinic._id }).sort({
      createdAt: -1,
    });
  }

  /**
   * Create staff member
   */
  async createStaff(data: any) {
    const {
      userId,

      name,
      email,
      phoneNumber,
      dateOfBirth,

      available,
      emergencyAvailability,

      position,

      educationDegree,
      university,
      graduationYear,
      degreeCertificate,

      veterinaryLicenseNumber,
      licenseIssuingAuthority,
      validFrom,

      workingDays,
      workingHours,

      documents,
    } = data;

    /**
     * Find clinic from logged-in vet
     */
    const clinic = await Clinic.findOne({ userId });

    if (!clinic) {
      throw new Error("Clinic not found for this user");
    }

    /**
     * Create staff linked to clinic
     */
    return Staff.create({
      clinicId: clinic._id,

      name,
      email,
      phoneNumber,
      dateOfBirth,

      available: available ?? true,
      emergencyAvailability: emergencyAvailability ?? false,

      position,

      educationDegree,
      university,
      graduationYear,
      degreeCertificate: degreeCertificate || null,

      veterinaryLicenseNumber,
      licenseIssuingAuthority,
      validFrom,

      workingDays: workingDays || [],

      workingHours: workingHours || {
        start: null,
        end: null,
      },

      documents: {
        governmentIdScan: documents?.governmentIdScan || null,
        degreeCertificate: documents?.degreeCertificate || null,
        licenceScan: documents?.licenceScan || null,
      },
    });
  }

  /**
   * Update staff member
   */
  async updateStaff(id: string, data: any) {
    return Staff.findByIdAndUpdate(
      id,
      {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phoneNumber !== undefined && {
          phoneNumber: data.phoneNumber,
        }),

        ...(data.dateOfBirth !== undefined && {
          dateOfBirth: data.dateOfBirth,
        }),

        ...(data.available !== undefined && {
          available: data.available,
        }),

        ...(data.emergencyAvailability !== undefined && {
          emergencyAvailability: data.emergencyAvailability,
        }),

        ...(data.position !== undefined && {
          position: data.position,
        }),

        ...(data.educationDegree !== undefined && {
          educationDegree: data.educationDegree,
        }),

        ...(data.university !== undefined && {
          university: data.university,
        }),

        ...(data.graduationYear !== undefined && {
          graduationYear: data.graduationYear,
        }),

        ...(data.degreeCertificate !== undefined && {
          degreeCertificate: data.degreeCertificate,
        }),

        ...(data.veterinaryLicenseNumber !== undefined && {
          veterinaryLicenseNumber: data.veterinaryLicenseNumber,
        }),

        ...(data.licenseIssuingAuthority !== undefined && {
          licenseIssuingAuthority: data.licenseIssuingAuthority,
        }),

        ...(data.validFrom !== undefined && {
          validFrom: data.validFrom,
        }),

        ...(data.workingDays !== undefined && {
          workingDays: data.workingDays,
        }),

        ...(data.workingHours !== undefined && {
          workingHours: data.workingHours,
        }),

        ...(data.documents !== undefined && {
          documents: {
            governmentIdScan: data.documents?.governmentIdScan || null,
            degreeCertificate: data.documents?.degreeCertificate || null,
            licenceScan: data.documents?.licenceScan || null,
          },
        }),
      },
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete staff member
   */
  async deleteStaff(id: string) {
    return Staff.findByIdAndDelete(id);
  }
}

export const staffService = new StaffService();