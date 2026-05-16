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

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parsePort(process.env.PORT),
  apiBasePath: normalizeApiBasePath(process.env.API_BASE_PATH),
};
