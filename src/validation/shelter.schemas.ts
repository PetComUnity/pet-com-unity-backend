import { z } from 'zod';

export const createShelterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email format'),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,15}$/, 'Invalid phone number format')
    .optional(),
  address: z.string().min(1, 'Address is required'),
  description: z.string().optional(),
});

export const updateShelterSchema = createShelterSchema.partial();

export type CreateShelterInput = z.infer<typeof createShelterSchema>;
export type UpdateShelterInput = z.infer<typeof updateShelterSchema>;
