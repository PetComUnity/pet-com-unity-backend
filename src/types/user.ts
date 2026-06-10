export type UserRole = 'owner' | 'vet' | 'shelter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  city?: string;
  avatarFileId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  city?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateCurrentUserInput {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  avatarFileId?: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city?: string;
  avatarFileId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  user: UserPublic;
  token: string;
}
