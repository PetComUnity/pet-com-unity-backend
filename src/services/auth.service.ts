import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { UserModel } from "../models/user.model";
import { Clinic } from "../models/clinic.model";
import { env } from "../config/env";
import { createAppError } from "../utils/api-response";
import { Shelter } from "../models/shelter.model";

function toUserPublic(doc: any) {
  const { _id, __v, passwordHash, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

function generateToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, env.jwtSecret, {
    expiresIn: "7d",
  });
}

class AuthService {
  /**
   * REGISTER
   */
  async register(payload: any) {
    const existing = await UserModel.findOne({ email: payload.email }).lean();

    if (existing) throw createAppError("User exists", 409);
    
    // 1. Force convert to a strict string primitive immediately
  const rawRegNum = payload.registrationNumber;
  const forcedRegistrationNumber = typeof rawRegNum === 'string' ? rawRegNum.trim() : String(rawRegNum || '');
  
  // 2. Safely extract properties out of payload
  const { registrationNumber, ...userPayload } = payload;
  console.log("Received payload:", payload);
  
  const passwordHash = await bcrypt.hash(payload.password, 10);

  const user = await UserModel.create({
    ...userPayload,
    passwordHash,
  });

    if (payload.role === "vet") {
  await Clinic.create({
    userId: user._id,

    name: payload.name,
    email: payload.email,

    website: payload.website ?? "",

    registrationNumber:
      forcedRegistrationNumber,

    phoneNumbers: payload.phone
      ? [payload.phone]
      : [],

    location:
      payload.address ??
      payload.city ??
      "",

    socialMediaLinks: [],

    verified: false,
  });
}

if (payload.role === "shelter") {
  await Shelter.create({
    userId: user._id,

    name: payload.name,
    email: payload.email,

    website: payload.website ?? "",

    registrationNumber:
      forcedRegistrationNumber,

    phoneNumbers: payload.phone
      ? [payload.phone]
      : [],

    location:
      payload.address ??
      payload.city ??
      "",

    socialMediaLinks: [],

    verified: false,
  });
}

    const userPublic = toUserPublic(user.toObject());
    const token = generateToken(userPublic.id, userPublic.role);

    return { user: userPublic, token };
  }

  /**
   * LOGIN
   */
  async login(payload: any) {
    const user = await UserModel.findOne({ email: payload.email }).lean();

    if (!user) throw createAppError("Invalid credentials", 401);

    const ok = await bcrypt.compare(payload.password, user.passwordHash);

    if (!ok) throw createAppError("Invalid credentials", 401);

    const userPublic = toUserPublic(user);
    const token = generateToken(userPublic.id, userPublic.role);

    return { user: userPublic, token };
  }

  /**
   * GET CURRENT USER
   */
  async getCurrentUser(userId: string) {
    const user = await UserModel.findById(userId).lean();

    if (!user) throw createAppError("User not found", 404);

      let organization = null;

      if (user.role === "vet") {
        organization = await Clinic.findOne({
          userId,
        }).lean();
      }

      if (user.role === "shelter") {
        organization = await Shelter.findOne({
          userId,
        }).lean();
      }

      return {
        user: toUserPublic(user),
        organization,
      };
    }
  /**
   * UPDATE USER
   */
  async updateCurrentUser(userId: string, payload: any) {
    const user = await UserModel.findByIdAndUpdate(userId, payload, {
      new: true,
    }).lean();

    if (!user) throw createAppError("User not found", 404);

    return toUserPublic(user);
  }

  async changePassword(userId: string, payload: any) {
    const user = await UserModel.findById(userId).lean();
    if (!user) throw createAppError("User not found", 404);

    const ok = await bcrypt.compare(payload.currentPassword, user.passwordHash);
    if (!ok) throw createAppError("Wrong password", 401);

    const hash = await bcrypt.hash(payload.newPassword, 10);

    await UserModel.findByIdAndUpdate(userId, {
      passwordHash: hash,
    });
  }
}

export const authService = new AuthService();