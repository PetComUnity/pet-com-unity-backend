export type UserRole = 'pet_owner' | 'vet' | 'shelter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}
