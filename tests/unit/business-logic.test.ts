import {
  assertCanAccessOwnedResource,
  canAccessOwnedResource,
  hasRole,
} from '../../src/utils/access-control';
import {
  comparePassword,
  generateJwtToken,
  hashPassword,
  verifyJwtToken,
} from '../../src/utils/auth';
import { buildCalendarDateFilter } from '../../src/utils/calendar-filters';
import {
  buildPetQuery,
  escapeRegex,
  getWeightRange,
} from '../../src/utils/pet-filters';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from '../../src/validation/auth.schemas';
import {
  createCalendarEventSchema,
  getCalendarEventsQuerySchema,
} from '../../src/validation/calendarEvent.schemas';
import { addPetDocumentSchema } from '../../src/validation/petDocument.schemas';
import {
  createPetSchema,
  getPetsQuerySchema,
} from '../../src/validation/pet.schemas';

describe('password utilities', () => {
  it('hashes passwords and compares valid/invalid candidates', async () => {
    const hash = await hashPassword('Password123!');

    expect(hash).not.toBe('Password123!');
    expect(await comparePassword('Password123!', hash)).toBe(true);
    expect(await comparePassword('wrong-password', hash)).toBe(false);
  });
});

describe('JWT utilities', () => {
  it('generates and verifies a user token', () => {
    const token = generateJwtToken('user-123', 'unit-secret');
    const payload = verifyJwtToken(token, 'unit-secret');

    expect(payload.userId).toBe('user-123');
  });

  it('rejects tokens signed with a different secret', () => {
    const token = generateJwtToken('user-123', 'unit-secret');

    expect(() => verifyJwtToken(token, 'other-secret')).toThrow();
  });
});

describe('Zod validation schemas', () => {
  it('accepts valid registration data', () => {
    expect(
      registerSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'owner',
      }).success,
    ).toBe(true);
  });

  it('rejects invalid registration data', () => {
    expect(
      registerSchema.safeParse({
        name: 'T',
        email: 'not-an-email',
        password: '123',
        role: 'owner',
      }).success,
    ).toBe(false);
  });

  it('accepts valid login data', () => {
    expect(
      loginSchema.safeParse({
        email: 'test@example.com',
        password: 'Password123!',
      }).success,
    ).toBe(true);
  });

  it('rejects identical current and new passwords', () => {
    // changePasswordSchema uses .refine() to enforce currentPassword !== newPassword
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'Password123!',
        newPassword: 'Password123!',
      }).success,
    ).toBe(false);
  });

  it('accepts valid pet creation data', () => {
    expect(
      createPetSchema.safeParse({
        name: 'Mila',
        species: 'dog',
        weight: 12,
        imageUrl: 'https://example.com/mila.jpg',
      }).success,
    ).toBe(true);
  });

  it('rejects invalid pet creation data', () => {
    expect(
      createPetSchema.safeParse({
        name: '',
        species: 'dog',
        weight: -1,
      }).success,
    ).toBe(false);
  });

  it('coerces string query params for pet filters', () => {
    const query = getPetsQuerySchema.parse({
      isAdoptable: 'true',
      size: 'M',
      page: '2',
      limit: '5',
    });

    expect(query).toMatchObject({
      isAdoptable: true,
      size: 'M',
      page: 2,
      limit: 5,
    });
  });

  it('accepts valid calendar event creation data', () => {
    expect(
      createCalendarEventSchema.safeParse({
        petId: 'pet-1',
        title: 'Vaccination',
        date: '2026-06-15T10:00:00.000Z',
        eventType: 'vaccination',
      }).success,
    ).toBe(true);
  });

  it('rejects invalid calendar event creation data', () => {
    expect(
      createCalendarEventSchema.safeParse({
        petId: 'pet-1',
        title: '',
        date: 'June 15',
      }).success,
    ).toBe(false);
  });

  it('coerces calendar events query params', () => {
    expect(
      getCalendarEventsQuerySchema.parse({ month: '6', year: '2026' }),
    ).toMatchObject({ month: 6, year: 2026 });
  });

  it('accepts valid pet document data', () => {
    expect(
      addPetDocumentSchema.safeParse({
        name: 'Certificate',
        issuedDate: '2026-06-01',
        fileId: 'documents/certificate',
      }).success,
    ).toBe(true);
  });
});

describe('access-control helpers', () => {
  it('allows matching owners and rejects non-owners', () => {
    expect(canAccessOwnedResource('owner-1', 'owner-1')).toBe(true);
    expect(canAccessOwnedResource('owner-1', 'owner-2')).toBe(false);
    try {
      assertCanAccessOwnedResource('owner-1', 'owner-2');
      throw new Error('Expected access check to throw');
    } catch (error) {
      expect(error).toMatchObject({ statusCode: 403 });
    }
  });

  it('checks allowed roles', () => {
    expect(hasRole('admin', ['admin'])).toBe(true);
    expect(hasRole('vet', ['vet', 'admin'])).toBe(true);
    expect(hasRole('owner', ['admin'])).toBe(false);
  });
});

describe('pet filtering helpers', () => {
  it('builds case-insensitive species and location searches', () => {
    expect(buildPetQuery({ species: 'Dog', location: 'Skopje' })).toMatchObject(
      {
        species: { $regex: '^Dog$', $options: 'i' },
        location: { $regex: 'Skopje', $options: 'i' },
      },
    );
  });

  it('converts size categories into weight ranges', () => {
    expect(getWeightRange('S')).toEqual({ $gte: 0, $lt: 10 });
    expect(getWeightRange('M')).toEqual({ $gte: 10, $lt: 25 });
    expect(getWeightRange('L')).toEqual({ $gte: 25 });
  });

  it('escapes regular-expression special characters from user input', () => {
    const escaped = escapeRegex('dog.*(north)[1]?');

    expect(new RegExp(escaped).test('dog.*(north)[1]?')).toBe(true);
    expect(new RegExp(escaped).test('dogZZnorth1')).toBe(false);
    expect(buildPetQuery({ species: 'cat.*' })).toMatchObject({
      species: { $regex: '^cat\\.\\*$', $options: 'i' },
    });
  });
});

describe('calendar date filtering helper', () => {
  it('builds a month range when month and year are provided', () => {
    const filter = buildCalendarDateFilter({ month: 6, year: 2026 });

    expect(filter?.$gte.getTime()).toBe(new Date(2026, 5, 1).getTime());
    expect(filter?.$lt.getTime()).toBe(new Date(2026, 6, 1).getTime());
  });

  it('builds a year range when only year is provided', () => {
    const filter = buildCalendarDateFilter({ year: 2026 });

    expect(filter?.$gte.getTime()).toBe(new Date(2026, 0, 1).getTime());
    expect(filter?.$lt.getTime()).toBe(new Date(2027, 0, 1).getTime());
  });
});
