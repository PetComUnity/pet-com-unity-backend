import { Clinic } from '../models/clinic.model';
import { Shelter } from '../models/shelter.model';
import { UserModel } from '../models/user.model';
import {
  AuthResult,
  ChangePasswordInput,
  LoginUserInput,
  RegisterUserInput,
  UpdateCurrentUserInput,
  UserPublic,
} from '../types/user';
import { createAppError } from '../utils/api-response';
import { comparePassword, generateJwtToken, hashPassword } from '../utils/auth';

interface CurrentUserResult {
  user: UserPublic;
  organization: unknown | null;
}

function toUserPublic(doc: any): UserPublic {
  const { _id, __v, passwordHash, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

function normalizeRegistrationNumber(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const registrationNumber = String(value).trim();
  return registrationNumber.length > 0 ? registrationNumber : undefined;
}

class AuthService {
  async register(payload: RegisterUserInput): Promise<AuthResult> {
    const existing = await UserModel.findOne({ email: payload.email }).lean();

    if (existing) {
      throw createAppError('User with this email already exists', 409);
    }

    const passwordHash = await hashPassword(payload.password);

    const user = await UserModel.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role,
      phone: payload.phone,
      city: payload.city,
      website: payload.website,
      socialMediaLink: payload.socialMediaLink,
      address: payload.address,
    });

    const registrationNumber = normalizeRegistrationNumber(
      payload.registrationNumber,
    );
    const organizationPayload = {
      userId: user._id,
      name: payload.name,
      email: payload.email,
      website: payload.website ?? '',
      ...(registrationNumber ? { registrationNumber } : {}),
      phoneNumbers: payload.phone ? [payload.phone] : [],
      location: payload.address ?? payload.city ?? '',
      socialMediaLinks: [],
      verified: false,
    };

    if (payload.role === 'vet') {
      await Clinic.create(organizationPayload);
    }

    if (payload.role === 'shelter') {
      await Shelter.create(organizationPayload);
    }

    const userPublic = toUserPublic(user.toObject());
    const token = generateJwtToken(userPublic.id, userPublic.role);

    return { user: userPublic, token };
  }

  async login(payload: LoginUserInput): Promise<AuthResult> {
    const user = await UserModel.findOne({ email: payload.email }).lean();

    if (!user) {
      throw createAppError('Invalid email or password', 401);
    }

    const isPasswordValid = await comparePassword(
      payload.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw createAppError('Invalid email or password', 401);
    }

    const userPublic = toUserPublic(user);
    const token = generateJwtToken(userPublic.id, userPublic.role);

    return { user: userPublic, token };
  }

  async getCurrentUser(userId: string): Promise<CurrentUserResult> {
    const user = await UserModel.findById(userId).lean();

    if (!user) {
      throw createAppError('User not found', 404);
    }

    let organization = null;

    if (user.role === 'vet') {
      organization = await Clinic.findOne({ userId }).lean();
    }

    if (user.role === 'shelter') {
      organization = await Shelter.findOne({ userId }).lean();
    }

    return {
      user: toUserPublic(user),
      organization,
    };
  }

  async changePassword(
    userId: string,
    payload: ChangePasswordInput,
  ): Promise<void> {
    const user = await UserModel.findById(userId).lean();

    if (!user) {
      throw createAppError('User not found', 404);
    }

    const isCurrentPasswordValid = await comparePassword(
      payload.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw createAppError('Current password is incorrect', 401);
    }

    const passwordHash = await hashPassword(payload.newPassword);

    await UserModel.findByIdAndUpdate(userId, { passwordHash });
  }

  async updateCurrentUser(
    userId: string,
    payload: UpdateCurrentUserInput,
  ): Promise<UserPublic> {
    if (payload.email) {
      const existing = await UserModel.findOne({
        email: payload.email,
        _id: { $ne: userId },
      }).lean();

      if (existing) {
        throw createAppError('User with this email already exists', 409);
      }
    }

    const user = await UserModel.findByIdAndUpdate(userId, payload, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();

    if (!user) {
      throw createAppError('User not found', 404);
    }

    return toUserPublic(user);
  }
}

export const authService = new AuthService();
