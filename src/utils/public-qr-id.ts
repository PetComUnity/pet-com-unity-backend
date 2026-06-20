import { randomBytes } from 'crypto';

export const PUBLIC_QR_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_PUBLIC_QR_ID_LENGTH = 80;
const MAX_SLUG_BASE_LENGTH = 48;

export function isValidPublicQrId(value: string): boolean {
  return (
    value.length >= 3 &&
    value.length <= MAX_PUBLIC_QR_ID_LENGTH &&
    PUBLIC_QR_ID_PATTERN.test(value)
  );
}

function slugifyPetName(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_BASE_LENGTH)
    .replace(/-+$/g, '');

  return slug || 'pet';
}

export function generatePublicQrId(name: string): string {
  return `${slugifyPetName(name)}-${randomBytes(4).toString('hex')}`;
}
