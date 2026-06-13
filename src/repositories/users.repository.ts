import { UserModel } from '../models/user.model';
import type { UserPublic } from '../types/user';

function toUserPublic(doc: any): UserPublic {
  const { _id, __v, passwordHash, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

class UsersRepository {
  async getAll(): Promise<UserPublic[]> {
    const users = await UserModel.find().sort({ createdAt: -1 }).lean();
    return users.map(toUserPublic);
  }
}

export const usersRepository = new UsersRepository();
