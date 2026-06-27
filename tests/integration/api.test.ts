import https from 'https';
import { Readable } from 'stream';
import request from 'supertest';
import app from '../../src/app';
import { PetDocumentModel } from '../../src/models/petDocument.model';
import { PetModel } from '../../src/models/pet.model';
import { VerificationRecordModel } from '../../src/models/verificationRecord.model';
import { mockCloudinary } from '../mocks/cloudinary.mock';
import {
  authHeader,
  createTestCalendarEvent,
  createTestDocument,
  createTestPet,
  createTestUser,
  makeCalendarEventPayload,
  makePetPayload,
  makeRegisterPayload,
} from '../helpers/factories';

function mockStorageDownload(body = 'private file'): jest.SpyInstance {
  return jest.spyOn(https, 'get').mockImplementation(((...args: any[]) => {
    const callback = args.find((arg) => typeof arg === 'function') as
      | ((response: Readable & { statusCode: number; headers: object }) => void)
      | undefined;
    const upstream = new Readable({
      read() {
        this.push(Buffer.from(body));
        this.push(null);
      },
    }) as Readable & { statusCode: number; headers: object };

    upstream.statusCode = 200;
    upstream.headers = {
      'content-type': 'application/pdf',
      'content-length': Buffer.byteLength(body).toString(),
    };

    callback?.(upstream);

    return {
      on: jest.fn().mockReturnThis(),
    };
  }) as any);
}

describe('authentication API', () => {
  it('registers a user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(makeRegisterPayload());

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user.email).toContain('@example.com');
    expect(response.body.data.user.passwordHash).toBeUndefined();
  });

  it('rejects invalid registration data', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'A',
      email: 'invalid-email',
      password: '123',
      role: 'owner',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('logs in with valid credentials', async () => {
    const { user, password } = await createTestUser();

    const response = await request(app).post('/api/auth/login').send({
      email: user.email,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user.id).toBe(user.id);
    expect(response.body.data.token).toEqual(expect.any(String));
  });

  it('rejects login with an incorrect password', async () => {
    const { user } = await createTestUser();

    const response = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('denies protected routes without a token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('denies protected routes with an invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-token');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid or expired token');
  });
});

describe('pets API', () => {
  it('allows an authorized user to create a pet profile', async () => {
    const { token, user } = await createTestUser();

    const response = await request(app)
      .post('/api/pets')
      .set('Authorization', authHeader(token))
      .send(makePetPayload({ name: 'Luna', species: 'cat' }));

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Luna');
    expect(response.body.data.ownerId).toBe(user.id);
  });

  it('returns only the authenticated user pet profiles', async () => {
    const owner = await createTestUser();
    const other = await createTestUser();
    await createTestPet(owner.user.id, { name: 'Owner Pet' });
    await createTestPet(other.user.id, { name: 'Other Pet' });

    const response = await request(app)
      .get('/api/me/pets')
      .set('Authorization', authHeader(owner.token));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe('Owner Pet');
  });

  it('supports filters and pagination on pet listing', async () => {
    const owner = await createTestUser();
    await createTestPet(owner.user.id, {
      name: 'Dog One',
      species: 'dog',
      weight: 12,
      location: 'Skopje Center',
    });
    await createTestPet(owner.user.id, {
      name: 'Dog Two',
      species: 'DOG',
      weight: 20,
      location: 'skopje North',
    });
    await createTestPet(owner.user.id, {
      name: 'Large Dog',
      species: 'dog',
      weight: 30,
      location: 'Skopje',
    });
    await createTestPet(owner.user.id, {
      name: 'Cat',
      species: 'cat',
      weight: 6,
      location: 'Skopje',
    });

    const response = await request(app).get(
      '/api/pets?species=DoG&location=skopje&size=M&page=1&limit=1',
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 1,
      total: 2,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  });

  it('loads a public pet profile by publicQrId without authentication', async () => {
    const owner = await createTestUser();
    await createTestPet(owner.user.id, {
      name: 'Milo',
      species: 'Dog',
      breed: 'Mixed breed',
      birthDate: '2022-04-12',
      color: 'Brown',
      gender: 'male',
      description: 'Friendly and curious.',
      imageUrl: 'https://images.example.com/milo.jpg',
      isLost: false,
      isAdoptable: false,
      verificationStatus: 'verified',
      publicQrId: 'milo-ab12cd34',
    });

    const response = await request(app).get('/api/pets/public/milo-ab12cd34');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Public pet profile loaded.',
      data: {
        name: 'Milo',
        species: 'Dog',
        breed: 'Mixed breed',
        birthDate: '2022-04-12',
        color: 'Brown',
        gender: 'male',
        description: 'Friendly and curious.',
        imageUrl: 'https://images.example.com/milo.jpg',
        isLost: false,
        isAdoptable: false,
        verificationStatus: 'verified',
        publicQrId: 'milo-ab12cd34',
      },
    });
    expect(Object.keys(response.body.data).sort()).toEqual(
      [
        'birthDate',
        'breed',
        'color',
        'description',
        'gender',
        'imageUrl',
        'isAdoptable',
        'isLost',
        'name',
        'publicQrId',
        'species',
        'verificationStatus',
      ].sort(),
    );
  });

  it('returns 404 for an unknown publicQrId', async () => {
    const response = await request(app).get(
      '/api/pets/public/missing-public-profile',
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: 'Public pet profile not found.',
    });
  });

  it('does not leak private fields from public pet profiles', async () => {
    const owner = await createTestUser();
    await createTestPet(owner.user.id, {
      name: 'Private Fields Pet',
      species: 'dog',
      imageUrl:
        'https://res.cloudinary.com/test-cloud/image/upload/v1/pet-avatars/private/private-file.jpg',
      imageFileId: 'pet-avatars/private/private-file',
      microchipId: 'secret-chip',
      publicQrId: 'private-fields-pet',
    });

    const response = await request(app).get(
      '/api/pets/public/private-fields-pet',
    );

    expect(response.status).toBe(200);
    for (const field of [
      '_id',
      'id',
      'ownerId',
      'owner',
      'ownerEmail',
      'ownerPhone',
      'imageFileId',
      'documents',
      'medicalFiles',
      'microchipId',
    ]) {
      expect(response.body.data).not.toHaveProperty(field);
    }
    expect(response.body.data).not.toHaveProperty('imageUrl');
    expect(JSON.stringify(response.body.data)).not.toContain('private-file');
    expect(JSON.stringify(response.body.data)).not.toContain('secret-chip');
  });

  it('generates publicQrId when creating a pet without one', async () => {
    const { token } = await createTestUser();

    const response = await request(app)
      .post('/api/pets')
      .set('Authorization', authHeader(token))
      .send(makePetPayload({ name: 'Luna Belle', species: 'dog' }));

    expect(response.status).toBe(201);
    expect(response.body.data.publicQrId).toMatch(/^luna-belle-[a-f0-9]{8}$/);
  });

  it('rejects duplicate frontend-provided publicQrId values', async () => {
    const { token } = await createTestUser();
    const publicQrId = 'shared-qr-123';

    const first = await request(app)
      .post('/api/pets')
      .set('Authorization', authHeader(token))
      .send(makePetPayload({ name: 'First Pet', publicQrId }));
    const second = await request(app)
      .post('/api/pets')
      .set('Authorization', authHeader(token))
      .send(makePetPayload({ name: 'Second Pet', publicQrId }));

    expect(first.status).toBe(201);
    expect(second.status).toBe(409);
    expect(second.body).toEqual({
      success: false,
      message: 'Public QR ID already exists',
    });
  });

  it('rejects invalid pet data', async () => {
    const { token } = await createTestUser();

    const response = await request(app)
      .post('/api/pets')
      .set('Authorization', authHeader(token))
      .send({ name: '', species: 'dog', weight: -1 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('prevents users from modifying another user pet profile', async () => {
    const owner = await createTestUser();
    const other = await createTestUser();
    const pet = await createTestPet(other.user.id, { name: 'Not Yours' });

    const response = await request(app)
      .put(`/api/pets/${pet.id}`)
      .set('Authorization', authHeader(owner.token))
      .send({ name: 'Changed' });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Forbidden');
  });
});

describe('role-based access API', () => {
  it('denies owner access to an admin-only endpoint', async () => {
    const owner = await createTestUser({ role: 'owner' });

    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', authHeader(owner.token));

    expect(response.status).toBe(403);
  });

  it('allows admin access to an admin-only endpoint', async () => {
    const admin = await createTestUser({ role: 'admin' });
    await createTestUser({ role: 'owner' });

    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', authHeader(admin.token));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].passwordHash).toBeUndefined();
  });

  it('enforces veterinarian creation role restrictions', async () => {
    const owner = await createTestUser({ role: 'owner' });
    const vet = await createTestUser({ role: 'vet' });
    const vetPayload = {
      name: 'Dr. Ana',
      clinicName: 'Happy Paws',
      email: 'vet@example.com',
    };

    const denied = await request(app)
      .post('/api/vets')
      .set('Authorization', authHeader(owner.token))
      .send(vetPayload);
    const allowed = await request(app)
      .post('/api/vets')
      .set('Authorization', authHeader(vet.token))
      .send(vetPayload);

    expect(denied.status).toBe(403);
    expect(allowed.status).toBe(201);
  });

  it('enforces shelter creation role restrictions', async () => {
    const owner = await createTestUser({ role: 'owner' });
    const shelter = await createTestUser({ role: 'shelter' });
    const shelterPayload = {
      name: 'City Shelter',
      email: 'shelter@example.com',
      address: 'Main Street 1',
    };

    const denied = await request(app)
      .post('/api/shelters')
      .set('Authorization', authHeader(owner.token))
      .send(shelterPayload);
    const allowed = await request(app)
      .post('/api/shelters')
      .set('Authorization', authHeader(shelter.token))
      .send(shelterPayload);

    expect(denied.status).toBe(403);
    expect(allowed.status).toBe(201);
  });
});

describe('clinic pet verification API', () => {
  it('allows a vet to search a pet by microchip number', async () => {
    const owner = await createTestUser();
    const vet = await createTestUser({ role: 'vet' });
    const pet = await createTestPet(owner.user.id, {
      name: 'Verified Candidate',
      species: 'dog',
      breed: 'mixed',
      gender: 'female',
      birthDate: '2022-04-12',
      microchipId: '123456789',
      passportNumber: 'MK-PASS-1',
      imageUrl: 'https://images.example.com/pet.jpg',
    });

    const response = await request(app)
      .get('/api/clinics/pets/lookup?microchipId=123456789')
      .set('Authorization', authHeader(vet.token));

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: pet.id,
      name: 'Verified Candidate',
      species: 'dog',
      breed: 'mixed',
      gender: 'female',
      dateOfBirth: '2022-04-12',
      imageUrl: 'https://images.example.com/pet.jpg',
      microchipId: '123456789',
      passportNumber: 'MK-PASS-1',
      verificationStatus: 'unverified',
    });
  });

  it('returns 404 when a microchip lookup has no matching pet', async () => {
    const vet = await createTestUser({ role: 'vet' });

    const response = await request(app)
      .get('/api/clinics/pets/lookup?microchipId=unknown-chip')
      .set('Authorization', authHeader(vet.token));

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Pet not found');
  });

  it('requires JWT authentication for pet lookup', async () => {
    const response = await request(app).get(
      '/api/clinics/pets/lookup?microchipId=123456789',
    );

    expect(response.status).toBe(401);
  });

  it('denies owner role access to pet verification', async () => {
    const owner = await createTestUser({ role: 'owner' });
    const pet = await createTestPet(owner.user.id, {
      microchipId: 'owner-denied-chip',
    });

    const response = await request(app)
      .post(`/api/clinics/pets/${pet.id}/verify`)
      .set('Authorization', authHeader(owner.token))
      .send({
        microchipId: 'owner-denied-chip',
        result: 'verified',
        microchipMatched: true,
        passportMatched: true,
        visualCheckPassed: true,
      });

    expect(response.status).toBe(403);
  });

  it('allows a vet to verify a pet when all checks pass', async () => {
    const owner = await createTestUser();
    const vet = await createTestUser({ role: 'vet', name: 'Dr. Ana' });
    const pet = await createTestPet(owner.user.id, {
      microchipId: 'verify-chip-1',
      passportNumber: 'PASS-1',
    });

    const response = await request(app)
      .post(`/api/clinics/pets/${pet.id}/verify`)
      .set('Authorization', authHeader(vet.token))
      .send({
        microchipId: 'verify-chip-1',
        result: 'verified',
        microchipMatched: true,
        passportMatched: true,
        visualCheckPassed: true,
        note: 'Microchip and passport match the digital profile.',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.pet).toMatchObject({
      id: pet.id,
      verificationStatus: 'verified',
      verifiedBy: vet.user.id,
      verifiedByName: 'Dr. Ana',
      verificationNote: 'Microchip and passport match the digital profile.',
    });
    expect(response.body.data.verificationRecord).toMatchObject({
      petId: pet.id,
      doctorId: vet.user.id,
      doctorName: 'Dr. Ana',
      microchipId: 'verify-chip-1',
      result: 'verified',
      microchipMatched: true,
      passportMatched: true,
      visualCheckPassed: true,
    });
  });

  it('rejects verified result when the provided microchip does not match', async () => {
    const owner = await createTestUser();
    const vet = await createTestUser({ role: 'vet' });
    const pet = await createTestPet(owner.user.id, {
      microchipId: 'right-chip',
    });

    const response = await request(app)
      .post(`/api/clinics/pets/${pet.id}/verify`)
      .set('Authorization', authHeader(vet.token))
      .send({
        microchipId: 'wrong-chip',
        result: 'verified',
        microchipMatched: true,
        passportMatched: true,
        visualCheckPassed: true,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Microchip number does not match the pet profile',
    );
    expect(
      await VerificationRecordModel.countDocuments({ petId: pet.id }),
    ).toBe(0);
  });

  it('records rejected verification and updates the pet status', async () => {
    const owner = await createTestUser();
    const vet = await createTestUser({ role: 'vet' });
    const pet = await createTestPet(owner.user.id, {
      microchipId: 'expected-chip',
    });

    const response = await request(app)
      .post(`/api/clinics/pets/${pet.id}/verify`)
      .set('Authorization', authHeader(vet.token))
      .send({
        microchipId: 'wrong-chip',
        result: 'rejected',
        microchipMatched: false,
        passportMatched: false,
        visualCheckPassed: true,
        note: 'Microchip does not match the digital profile.',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.pet.verificationStatus).toBe('rejected');
    expect(response.body.data.verificationRecord).toMatchObject({
      petId: pet.id,
      result: 'rejected',
      microchipId: 'wrong-chip',
      microchipMatched: false,
      passportMatched: false,
      visualCheckPassed: true,
    });
    expect(
      await VerificationRecordModel.countDocuments({ petId: pet.id }),
    ).toBe(1);
  });

  it('resets verified pet status to pending when identity fields change', async () => {
    const owner = await createTestUser();
    const pet = await createTestPet(owner.user.id, {
      microchipId: 'stable-chip',
      passportNumber: 'PASS-OLD',
      verificationStatus: 'verified',
    });

    const response = await request(app)
      .put(`/api/pets/${pet.id}`)
      .set('Authorization', authHeader(owner.token))
      .send({ passportNumber: 'PASS-NEW' });

    expect(response.status).toBe(200);
    expect(response.body.data.verificationStatus).toBe('pending');
    expect(response.body.data.verificationNote).toBe(
      'Identity fields changed after verification; verification reset to pending.',
    );
  });

  it('does not leak sensitive fields in the microchip lookup response', async () => {
    const owner = await createTestUser();
    const vet = await createTestUser({ role: 'vet' });
    await createTestPet(owner.user.id, {
      name: 'Private Lookup Pet',
      microchipId: 'private-chip',
      passportNumber: 'PRIVATE-PASS',
      imageFileId: 'pet-avatars/private/private-file',
      imageUrl:
        'https://res.cloudinary.com/test-cloud/image/upload/v1/pet-avatars/private/private-file.jpg',
    });

    const response = await request(app)
      .get('/api/clinics/pets/lookup?microchipId=private-chip')
      .set('Authorization', authHeader(vet.token));

    expect(response.status).toBe(200);
    for (const field of [
      '_id',
      'ownerId',
      'owner',
      'ownerEmail',
      'ownerPhone',
      'passwordHash',
      'imageFileId',
      'documents',
      'medicalFiles',
    ]) {
      expect(response.body.data).not.toHaveProperty(field);
    }
    expect(response.body.data).not.toHaveProperty('imageUrl');
    expect(JSON.stringify(response.body.data)).not.toContain('private-file');
  });

  it('returns verification history for a pet', async () => {
    const owner = await createTestUser();
    const vet = await createTestUser({ role: 'vet' });
    const pet = await createTestPet(owner.user.id, {
      microchipId: 'history-chip',
    });

    await request(app)
      .post(`/api/clinics/pets/${pet.id}/verify`)
      .set('Authorization', authHeader(vet.token))
      .send({
        microchipId: 'history-chip',
        result: 'pending',
        microchipMatched: true,
        passportMatched: false,
        visualCheckPassed: true,
      });

    const response = await request(app)
      .get(`/api/clinics/pets/${pet.id}/verifications`)
      .set('Authorization', authHeader(vet.token));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      petId: pet.id,
      result: 'pending',
      microchipId: 'history-chip',
    });
  });
});

describe('calendar API', () => {
  it('allows an authorized user to create a calendar event', async () => {
    const owner = await createTestUser();
    const pet = await createTestPet(owner.user.id);

    const response = await request(app)
      .post('/api/calendar/events')
      .set('Authorization', authHeader(owner.token))
      .send(makeCalendarEventPayload(pet.id));

    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe('Annual checkup');
    expect(response.body.data.ownerId).toBe(owner.user.id);
  });

  it('retrieves events by pet and month/year', async () => {
    const owner = await createTestUser();
    const pet = await createTestPet(owner.user.id, { name: 'Calendar Pet' });
    const otherPet = await createTestPet(owner.user.id, { name: 'Other Pet' });

    await createTestCalendarEvent(owner.user.id, pet.id, {
      title: 'June Event',
      date: '2026-06-10T10:00:00.000Z',
    });
    await createTestCalendarEvent(owner.user.id, pet.id, {
      title: 'July Event',
      date: '2026-07-10T10:00:00.000Z',
    });
    await createTestCalendarEvent(owner.user.id, otherPet.id, {
      title: 'Other Pet June',
      date: '2026-06-11T10:00:00.000Z',
    });

    const response = await request(app)
      .get(`/api/calendar/events?petId=${pet.id}&month=6&year=2026`)
      .set('Authorization', authHeader(owner.token));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe('June Event');
  });

  it('allows a user to edit their own event', async () => {
    const owner = await createTestUser();
    const pet = await createTestPet(owner.user.id);
    const event = await createTestCalendarEvent(owner.user.id, pet.id);

    const response = await request(app)
      .put(`/api/calendar/events/${event.id}`)
      .set('Authorization', authHeader(owner.token))
      .send({ title: 'Updated checkup' });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe('Updated checkup');
  });

  it('prevents editing or deleting another user event', async () => {
    const owner = await createTestUser();
    const other = await createTestUser();
    const pet = await createTestPet(other.user.id);
    const event = await createTestCalendarEvent(other.user.id, pet.id);

    const edit = await request(app)
      .put(`/api/calendar/events/${event.id}`)
      .set('Authorization', authHeader(owner.token))
      .send({ title: 'Nope' });
    const remove = await request(app)
      .delete(`/api/calendar/events/${event.id}`)
      .set('Authorization', authHeader(owner.token));

    expect(edit.status).toBe(403);
    expect(remove.status).toBe(403);
  });

  it('allows a user to delete their own event', async () => {
    const owner = await createTestUser();
    const pet = await createTestPet(owner.user.id);
    const event = await createTestCalendarEvent(owner.user.id, pet.id);

    const response = await request(app)
      .delete(`/api/calendar/events/${event.id}`)
      .set('Authorization', authHeader(owner.token));

    expect(response.status).toBe(200);
  });
});

describe('files and documents API', () => {
  it('rejects unsupported MIME types during file upload', async () => {
    const owner = await createTestUser();

    const response = await request(app)
      .post('/api/upload/document')
      .set('Authorization', authHeader(owner.token))
      .attach('file', Buffer.from('bad'), {
        filename: 'bad.exe',
        contentType: 'application/x-msdownload',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('rejects files that exceed the configured document size limit', async () => {
    const owner = await createTestUser();
    const largeFile = Buffer.alloc(10 * 1024 * 1024 + 1);

    const response = await request(app)
      .post('/api/upload/document')
      .set('Authorization', authHeader(owner.token))
      .attach('file', largeFile, {
        filename: 'large.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('File too large');
  });

  it('allows an authorized user to upload a valid file', async () => {
    const owner = await createTestUser();

    const response = await request(app)
      .post('/api/upload/document')
      .set('Authorization', authHeader(owner.token))
      .attach('file', Buffer.from('valid pdf'), {
        filename: 'record.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      fileId: 'documents/test-file',
      mimeType: 'application/pdf',
    });
    expect(mockCloudinary.uploader.upload).toHaveBeenCalledTimes(1);
  });

  it('denies private file access without JWT', async () => {
    const response = await request(app).get('/api/files/documents--file');

    expect(response.status).toBe(401);
  });

  it('denies private file access to users without ownership rights', async () => {
    const owner = await createTestUser();
    const other = await createTestUser();
    const pet = await createTestPet(owner.user.id);
    await createTestDocument(owner.user.id, pet.id, {
      fileId: 'documents/private-record',
    });

    const response = await request(app)
      .get('/api/files/documents--private-record')
      .set('Authorization', authHeader(other.token));

    expect(response.status).toBe(403);
  });

  it('allows an owner to access their own private file', async () => {
    const owner = await createTestUser();
    const pet = await createTestPet(owner.user.id);
    await createTestDocument(owner.user.id, pet.id, {
      fileId: 'documents/private-record',
      secureUrl:
        'https://res.cloudinary.com/test-cloud/raw/upload/v1/documents/private-record.pdf',
    });

    const getSpy = mockStorageDownload();

    try {
      const response = await request(app)
        .get('/api/files/documents--private-record')
        .set('Authorization', authHeader(owner.token));

      expect(response.status).toBe(200);
      expect(mockCloudinary.utils.private_download_url).toHaveBeenCalledWith(
        'documents/private-record',
        'pdf',
        { resource_type: 'raw', type: 'upload' },
      );
    } finally {
      getSpy.mockRestore();
    }
  });

  it('triggers Cloudinary deletion when a document is deleted', async () => {
    const owner = await createTestUser();
    const pet = await createTestPet(owner.user.id);
    const document = await createTestDocument(owner.user.id, pet.id, {
      fileId: 'documents/delete-me',
    });

    const response = await request(app)
      .delete(`/api/pets/${pet.id}/documents/${document.id}`)
      .set('Authorization', authHeader(owner.token));

    expect(response.status).toBe(200);
    expect(await PetDocumentModel.findById(document.id)).toBeNull();
    expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith(
      'documents/delete-me',
      { resource_type: 'image' },
    );
    expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith(
      'documents/delete-me',
      { resource_type: 'raw' },
    );
  });
});
