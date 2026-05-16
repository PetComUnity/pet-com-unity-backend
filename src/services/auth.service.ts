import { randomUUID } from 'crypto';

import { AuthResult, LoginUserInput, RegisterUserInput, User } from '../types/user';

class AuthService {
  async register(payload: RegisterUserInput): Promise<AuthResult> {
    const timestamp = new Date().toISOString();

    const user: User = {
      id: randomUUID(),
      name: payload.name,
      email: payload.email,
      role: payload.role,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // TODO: Save the user in a real database when Prisma/PostgreSQL or MongoDB is added.
    // TODO: Hash the password and generate a real JWT token.
    return {
      user,
      token: 'mock-token',
    };
  }

  async login(payload: LoginUserInput): Promise<AuthResult> {
    const timestamp = new Date().toISOString();

    // TODO: Validate the user credentials against a real database.
    // TODO: Replace this mock user with the authenticated database user.
    const user: User = {
      id: 'mock-user-1',
      name: 'John Doe',
      email: payload.email,
      role: 'pet_owner',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // TODO: Generate a real JWT token after authentication is implemented.
    return {
      user,
      token: 'mock-token',
    };
  }

  async getCurrentUser(): Promise<User> {
    // TODO: Read the authenticated user from a JWT/session once auth is implemented.
    // TODO: Fetch the current user from the database instead of returning mock data.
    return {
      id: 'mock-user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'pet_owner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const authService = new AuthService();
