import { z } from 'zod';

export const createPetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().optional(),
  weight: z.number().nonnegative('Weight cannot be negative').optional(),
  location: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  birthDate: z.string().optional(),
  color: z.string().optional(),
  themeColor: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  imageFileId: z.string().optional(),
  microchipId: z.string().optional(),
  isLost: z.boolean().optional(),
  isAdoptable: z.boolean().optional(),
});

export const updatePetSchema = createPetSchema.partial();

export const getPetsQuerySchema = z.object({
  isAdoptable: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  isLost: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  size: z.enum(['S', 'M', 'L']).optional(),
  location: z.string().trim().min(1, 'Location cannot be empty').optional(),
  species: z.string().trim().min(1, 'Species cannot be empty').optional(),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
});

export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
export type GetPetsQueryInput = z.infer<typeof getPetsQuerySchema>;
