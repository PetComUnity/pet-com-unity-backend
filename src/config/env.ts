import dotenv from 'dotenv';

dotenv.config();

const normalizeApiBasePath = (value: string | undefined): string => {
  if (!value || value.trim() === '') {
    return '/api';
  }

  return value.startsWith('/') ? value : `/${value}`;
};

const parsePort = (value: string | undefined): number => {
  const parsedPort = Number(value);

  if (Number.isInteger(parsedPort) && parsedPort > 0) {
    return parsedPort;
  }

  return 5000;
};

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parsePort(process.env.PORT),
  apiBasePath: normalizeApiBasePath(process.env.API_BASE_PATH),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
};
