import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtUserPayload extends JwtPayload {
  userId: string;
  role?: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function generateJwtToken(
  userId: string,
  role?: string,
  secret = env.jwtSecret,
): string {
  return jwt.sign({ userId, role }, secret, { expiresIn: '7d' });
}

export function verifyJwtToken(
  token: string,
  secret = env.jwtSecret,
): JwtUserPayload {
  const payload = jwt.verify(token, secret);

  if (typeof payload === 'string' || typeof payload.userId !== 'string') {
    throw new Error('Invalid token payload');
  }

  return payload as JwtUserPayload;
}
