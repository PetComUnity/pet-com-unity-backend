import { Shelter } from "../models/shelter.model"; // Ensure your model path is correct
import { UserModel } from "../models/user.model";

class SheltersService {

  async getShelters() {
    return Shelter.find().sort({ createdAt: -1 });
  }


  //  PUBLIC
  //  Get shelter by ID
 
  async getShelterById(shelterId: string) {
    return Shelter.findById(shelterId);
  }


   
  async getMyShelter(userId: string) {
    return Shelter.findOne({ userId });
  }


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

 async updateMyShelter(userId: string, data: any) {
  const updateData: any = {};

  // Filter fields to update
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

  // Update shelter collection
  const updatedShelter = await Shelter.findOneAndUpdate(
    { userId },
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedShelter) {
    throw new Error("Shelter not found");
  }


  if (data.name?.trim()) {
    await UserModel.findByIdAndUpdate(userId, {
      name: data.name.trim(),
    });
  }

  return updatedShelter;
}

  async deleteMyShelter(userId: string) {
    return Shelter.findOneAndDelete({ userId });
  }
}

export const sheltersService = new SheltersService();