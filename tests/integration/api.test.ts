import https from 'https';
import { Readable } from 'stream';
import request from 'supertest';
import app from '../../src/app';
import { PetDocumentModel } from '../../src/models/petDocument.model';
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
