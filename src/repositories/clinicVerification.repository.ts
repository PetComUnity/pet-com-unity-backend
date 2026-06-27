import { Clinic } from '../models/clinic.model';
import { PetModel } from '../models/pet.model';
import { UserModel } from '../models/user.model';
import { VerificationRecordModel } from '../models/verificationRecord.model';
import type {
  PetVerificationRecord,
  PetVerificationDecisionResult,
} from '../types/clinicVerification';
import type { Pet } from '../types/pet';

function toPet(doc: any): Pet {
  const { _id, __v, microchipNumber, ...rest } = doc;
  const microchipId = rest.microchipId ?? microchipNumber;
  const birthDate = rest.birthDate ?? rest.dateOfBirth;
  const dateOfBirth = rest.dateOfBirth ?? rest.birthDate;

  return {
    ...rest,
    microchipId,
    birthDate,
    dateOfBirth,
    id: _id.toString(),
  };
}

function toVerificationRecord(doc: any): PetVerificationRecord {
  const { _id, __v, microchipNumber, ...rest } = doc;
  return {
    ...rest,
    microchipId: rest.microchipId ?? microchipNumber,
    id: _id.toString(),
  };
}

export interface VerificationRecordCreateInput {
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
}

export interface PetVerificationUpdateInput {
  verificationStatus: PetVerificationDecisionResult;
  verifiedBy: string;
  verifiedByName?: string | null;
  verifiedClinicId?: string | null;
  verifiedClinicName?: string | null;
  verifiedAt: Date;
  verificationNote?: string | null;
  microchipId?: string;
}

export interface VerificationClinic {
  id: string;
  name?: string | null;
}

export interface VerificationUser {
  id: string;
  name?: string | null;
}

class ClinicVerificationRepository {
  async findPetByMicrochipId(microchipId: string): Promise<Pet | undefined> {
    const pet = await PetModel.findOne({
      $or: [{ microchipId }, { microchipNumber: microchipId }],
    }).lean();

    if (!pet) return undefined;
    return toPet(pet);
  }

  async getPetById(id: string): Promise<Pet | undefined> {
    const pet = await PetModel.findById(id).lean();
    if (!pet) return undefined;
    return toPet(pet);
  }

  async updatePetVerification(
    petId: string,
    payload: PetVerificationUpdateInput,
  ): Promise<Pet | undefined> {
    const pet = await PetModel.findByIdAndUpdate(petId, payload, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();

    if (!pet) return undefined;
    return toPet(pet);
  }

  async createVerificationRecord(
    payload: VerificationRecordCreateInput,
  ): Promise<PetVerificationRecord> {
    const record = await VerificationRecordModel.create(payload);
    return toVerificationRecord(record.toObject());
  }

  async getVerificationHistory(
    petId: string,
  ): Promise<PetVerificationRecord[]> {
    const records = await VerificationRecordModel.find({ petId })
      .sort({ createdAt: -1 })
      .lean();

    return records.map(toVerificationRecord);
  }

  async getVerifierUser(userId: string): Promise<VerificationUser | undefined> {
    const user = await UserModel.findById(userId).select('name').lean();

    if (!user) return undefined;
    return {
      id: user._id.toString(),
      name: user.name,
    };
  }

  async getClinicForUser(
    userId: string,
  ): Promise<VerificationClinic | undefined> {
    const clinic = await Clinic.findOne({ userId }).select('name').lean();

    if (!clinic) return undefined;
    return {
      id: clinic._id.toString(),
      name: clinic.name,
    };
  }
}

export const clinicVerificationRepository = new ClinicVerificationRepository();
