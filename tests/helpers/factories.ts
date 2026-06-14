import { randomUUID } from 'crypto';
import { CalendarEventModel } from '../../src/models/calendarEvent.model';
import { PetDocumentModel } from '../../src/models/petDocument.model';
import { PetModel } from '../../src/models/pet.model';
import { UserModel } from '../../src/models/user.model';
import type { UserRole } from '../../src/types/user';
import { generateJwtToken, hashPassword } from '../../src/utils/auth';

let sequence = 0;

function nextEmail(prefix: string): string {
  sequence += 1;
  return `${prefix}${sequence}@example.com`;
}

export function authHeader(token: string): string {
  return `Bearer ${token}`;
}

export async function createTestUser(
  overrides: Partial<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }> = {},
) {
  const password = overrides.password ?? 'Password123!';
  const user = await UserModel.create({
    name: overrides.name ?? 'Test User',
    email: overrides.email ?? nextEmail('user'),
    passwordHash: await hashPassword(password),
    role: overrides.role ?? 'owner',
  });

  return {
    user,
    password,
    token: generateJwtToken(user.id),
  };
}

export function makeRegisterPayload(
  overrides: Partial<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }> = {},
) {
  return {
    name: overrides.name ?? 'Register User',
    email: overrides.email ?? nextEmail('register'),
    password: overrides.password ?? 'Password123!',
    role: overrides.role ?? 'owner',
  };
}

export function makePetPayload(
  overrides: Partial<{
    name: string;
    species: string;
    breed: string;
    weight: number;
    location: string;
    gender: 'male' | 'female' | 'unknown';
    isAdoptable: boolean;
    isLost: boolean;
  }> = {},
) {
  return {
    name: overrides.name ?? 'Mila',
    species: overrides.species ?? 'dog',
    breed: overrides.breed ?? 'mixed',
    weight: overrides.weight ?? 12,
    location: overrides.location ?? 'Skopje',
    gender: overrides.gender ?? 'female',
    isAdoptable: overrides.isAdoptable ?? false,
    isLost: overrides.isLost ?? false,
  };
}

export async function createTestPet(
  ownerId: string,
  overrides: Partial<ReturnType<typeof makePetPayload>> = {},
) {
  return PetModel.create({
    ...makePetPayload(overrides),
    ownerId,
    publicQrId: randomUUID(),
    verificationStatus: 'unverified',
  });
}

export function makeCalendarEventPayload(
  petId: string,
  overrides: Partial<{
    title: string;
    date: string;
    eventType:
      | 'vaccination'
      | 'vet_visit'
      | 'checkup'
      | 'grooming'
      | 'medication'
      | 'other';
    description: string;
  }> = {},
) {
  return {
    petId,
    title: overrides.title ?? 'Annual checkup',
    date: overrides.date ?? '2026-06-15T10:00:00.000Z',
    eventType: overrides.eventType ?? 'checkup',
    description: overrides.description ?? 'Routine visit',
  };
}

export async function createTestCalendarEvent(
  ownerId: string,
  petId: string,
  overrides: Partial<ReturnType<typeof makeCalendarEventPayload>> = {},
) {
  const payload = makeCalendarEventPayload(petId, overrides);
  return CalendarEventModel.create({
    ...payload,
    ownerId,
    date: new Date(payload.date),
  });
}

export async function createTestDocument(
  ownerId: string,
  petId: string,
  overrides: Partial<{
    name: string;
    issuedDate: string;
    fileId: string;
    mimeType: string;
    secureUrl: string;
  }> = {},
) {
  return PetDocumentModel.create({
    petId,
    ownerId,
    name: overrides.name ?? 'Vaccination certificate',
    issuedDate: overrides.issuedDate ?? '2026-06-01',
    fileId: overrides.fileId ?? `documents/${randomUUID()}`,
    mimeType: overrides.mimeType ?? 'application/pdf',
    secureUrl:
      overrides.secureUrl ??
      'https://res.cloudinary.com/test-cloud/raw/upload/v1/documents/test-file.pdf',
  });
}
