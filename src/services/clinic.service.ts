import { Clinic } from "../models/clinic.model";

class ClinicsService {
  /**
   * =========================
   * PUBLIC
   * Get all clinics
   * =========================
   */
  async getClinics() {
    return Clinic.find().sort({ createdAt: -1 });
  }

  /**
   * =========================
   * PUBLIC
   * Get clinic by ID
   * =========================
   */
  async getClinicById(clinicId: string) {
    return Clinic.findById(clinicId);
  }

  /**
   * =========================
   * AUTH
   * Get clinic by logged-in user
   * =========================
   */
  async getMyClinic(userId: string) {
    return Clinic.findOne({ userId });
  }

  /**
   * =========================
   * AUTH
   * Create clinic for vet user
   * =========================
   */
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

  /**
   * =========================
   * AUTH
   * Update clinic by userId
   * =========================
   */
 async updateMyClinic(userId: string, data: any) {
  const updateData: any = {};

  // ... (keep your existing field filtering logic)
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.registrationNumber !== undefined) updateData.registrationNumber = data.registrationNumber;
  if (data.phoneNumbers !== undefined) updateData.phoneNumbers = data.phoneNumbers;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.workingHours !== undefined) updateData.workingHours = data.workingHours;
  if (data.socialMediaLinks !== undefined) updateData.socialMediaLinks = data.socialMediaLinks;

  console.log("Searching for Clinic belonging to userId:", userId);

  // Use { userId: currentUserId } to find the document
  const updatedClinic = await Clinic.findOneAndUpdate(
    { userId: userId }, 
    { $set: updateData }, 
    { returnDocument: 'after', runValidators: true }
  );

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