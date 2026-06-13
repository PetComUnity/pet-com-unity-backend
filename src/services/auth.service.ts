import { UserModel } from '../models/user.model';
import {
  AuthResult,
  ChangePasswordInput,
  LoginUserInput,
  RegisterUserInput,
  UpdateCurrentUserInput,
  UserPublic,
} from '../types/user';
import { comparePassword, generateJwtToken, hashPassword } from '../utils/auth';
import { createAppError } from '../utils/api-response';

function toUserPublic(doc: any): UserPublic {
  const { _id, __v, passwordHash, ...rest } = doc;
  return { ...rest, id: _id.toString() };
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

    const userPublic = toUserPublic(user.toObject());
    const token = generateJwtToken(userPublic.id);

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
    const token = generateJwtToken(userPublic.id);

    return { user: userPublic, token };
  }

  async getCurrentUser(userId: string): Promise<UserPublic> {
    const user = await UserModel.findById(userId).lean();

    if (!user) {
      throw createAppError('User not found', 404);
    }

    return toUserPublic(user);
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
