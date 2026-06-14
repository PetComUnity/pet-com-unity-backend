import { Shelter } from "../models/shelter.model"; // Ensure your model path is correct

class SheltersService {
  /**
   * =========================
   * PUBLIC
   * Get all shelters
   * =========================
   */
  async getShelters() {
    return Shelter.find().sort({ createdAt: -1 });
  }

  /**
   * =========================
   * PUBLIC
   * Get shelter by ID
   * =========================
   */
  async getShelterById(shelterId: string) {
    return Shelter.findById(shelterId);
  }

  /**
   * =========================
   * AUTH
   * Get shelter by logged-in user
   * =========================
   */
  async getMyShelter(userId: string) {
    return Shelter.findOne({ userId });
  }

  /**
   * =========================
   * AUTH
   * Create shelter for shelter user
   * =========================
   */
  async createShelter(data: {
    userId: string;
    name: string;
    email?: string;
    website?: string;
    registrationNumber?: string;
    location?: string;
  }) {
    const { userId, name, email, website, registrationNumber, location } = data;

    // Prevent duplicate shelter per user
    const existing = await Shelter.findOne({ userId });

    if (existing) {
      throw new Error("Shelter profile already exists for this user");
    }

    const shelterData: any = {
      userId,
      name,
    };

    if (email) shelterData.email = email;
    if (website) shelterData.website = website;
    if (registrationNumber) shelterData.registrationNumber = registrationNumber;
    if (location) shelterData.location = location;

    return Shelter.create(shelterData);
  }

  /**
   * =========================
   * AUTH
   * Update shelter by userId
   * =========================
   */
  async updateMyShelter(userId: string, data: any) {
    const updateData: any = {};

    // Filter fields to update
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.registrationNumber !== undefined) updateData.registrationNumber = data.registrationNumber;
    if (data.phoneNumbers !== undefined) updateData.phoneNumbers = data.phoneNumbers;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.workingHours !== undefined) updateData.workingHours = data.workingHours;
    if (data.socialMediaLinks !== undefined) updateData.socialMediaLinks = data.socialMediaLinks;

    // Update the document
    const updatedShelter = await Shelter.findOneAndUpdate(
      { userId: userId }, 
      { $set: updateData }, 
      { returnDocument: 'after', runValidators: true }
    );

    return updatedShelter;
  }

  /**
   * =========================
   * AUTH
   * Delete shelter by userId
   * =========================
   */
  async deleteMyShelter(userId: string) {
    return Shelter.findOneAndDelete({ userId });
  }
}

export const sheltersService = new SheltersService();