import { z } from 'zod';

export const createPetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  birthDate: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  microchipId: z.string().optional(),
  isLost: z.boolean().optional(),
  isAdoptable: z.boolean().optional(),
});

export const updatePetSchema = createPetSchema.partial();

export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
