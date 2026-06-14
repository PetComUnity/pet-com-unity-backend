import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.mock('../../src/config/cloudinary', () =>
  require('../mocks/cloudinary.mock'),
);

const { resetCloudinaryMock } =
  require('../mocks/cloudinary.mock') as typeof import('../mocks/cloudinary.mock');

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
  jest.clearAllMocks();
  resetCloudinaryMock();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
