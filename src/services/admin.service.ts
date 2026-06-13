import { usersRepository } from '../repositories/users.repository';
import type { UserPublic } from '../types/user';

class AdminService {
  async getUsers(): Promise<UserPublic[]> {
    return usersRepository.getAll();
  }
}

export const adminService = new AdminService();
