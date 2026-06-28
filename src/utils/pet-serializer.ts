import type { Pet, PublicPetProfile } from '../types/pet';

const PRIVATE_IMAGE_PATH_MARKERS = [
  '/api/files/',
  '/documents/',
  '/pet-avatars/private/',
  '/user-avatars/private/',
];

export function isPublicSafeImageUrl(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return false;
    }

    const decodedPath = decodeURIComponent(url.pathname).toLowerCase();

    return !PRIVATE_IMAGE_PATH_MARKERS.some((marker) =>
      decodedPath.includes(marker),
    );
  } catch {
    return false;
  }
}

export function toPublicPetProfile(pet: Pet): PublicPetProfile {
  const profile: PublicPetProfile = {
    name: pet.name,
    species: pet.species,
    isLost: pet.isLost,
    isAdoptable: pet.isAdoptable,
    verificationStatus: pet.verificationStatus,
    publicQrId: pet.publicQrId,
  };

  if (pet.breed !== undefined) profile.breed = pet.breed;
  if (pet.birthDate !== undefined) profile.birthDate = pet.birthDate;
  if (pet.color !== undefined) profile.color = pet.color;
  if (pet.gender !== undefined) profile.gender = pet.gender;
  if (pet.description !== undefined) profile.description = pet.description;
  if (pet.imageUrl && isPublicSafeImageUrl(pet.imageUrl)) {
    profile.imageUrl = pet.imageUrl;
  }

  return profile;
}
