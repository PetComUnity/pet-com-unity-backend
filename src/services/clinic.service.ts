import { Clinic } from "../models/clinic.model";
import { UserModel } from "../models/user.model";

class ClinicsService {
  
  async getClinics() {
    return Clinic.find().sort({ createdAt: -1 });
  }

  
  async getClinicById(clinicId: string) {
    return Clinic.findById(clinicId);
  }

  // Get clinic by logged-in user
 
  async getMyClinic(userId: string) {
    return Clinic.findOne({ userId });
  }

 
// Create clinic for vet user
 
  async createClinic(data: {
    userId: string;
    name: string;
    email?: string;
    website?: string;
    registrationNumber?: string;
    location?: string;
  }) {
    const { userId, name, email, website, registrationNumber, location } =
      data;

    // Prevent duplicate clinic per vet
    const existing = await Clinic.findOne({ userId });

    if (existing) {
      throw new Error("Clinic already exists for this user");
    }

    const clinicData: any = {
      userId,
      name,
    };

    // ONLY set fields if they exist (IMPORTANT FIX)
    if (email) clinicData.email = email;
    if (website) clinicData.website = website;
    if (registrationNumber)
      clinicData.registrationNumber = registrationNumber;
    if (location) clinicData.location = location;

    return Clinic.create(clinicData);
  }

  
//Update clinic by userId
  
 async updateMyClinic(userId: string, data: any) {
  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.registrationNumber !== undefined)
    updateData.registrationNumber = data.registrationNumber;
  if (data.phoneNumbers !== undefined)
    updateData.phoneNumbers = data.phoneNumbers;
  if (data.location !== undefined)
    updateData.location = data.location;
  if (data.workingHours !== undefined)
    updateData.workingHours = data.workingHours;
  if (data.socialMediaLinks !== undefined)
    updateData.socialMediaLinks = data.socialMediaLinks;

  const updatedClinic = await Clinic.findOneAndUpdate(
    { userId },
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedClinic) {
    throw new Error("Clinic not found");
  }

  // Sync clinic name -> users collection
  if (data.name?.trim()) {
    await UserModel.findByIdAndUpdate(userId, {
      name: data.name.trim(),
    });
  }

  return updatedClinic;
}
  /**
   * =========================
   * AUTH
   * Delete clinic by userId
   * =========================
   */
  async deleteMyClinic(userId: string) {
    return Clinic.findOneAndDelete({ userId });
  }
}

export const clinicsService = new ClinicsService();