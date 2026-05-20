import { z } from 'zod';

export const createVetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  clinicName: z.string().min(1, 'Clinic name is required'),
  email: z.string().email('Invalid email format'),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,15}$/, 'Invalid phone number format')
    .optional(),
  address: z.string().optional(),
  specialization: z.string().optional(),
});

export const updateVetSchema = createVetSchema.partial();

export type CreateVetInput = z.infer<typeof createVetSchema>;
export type UpdateVetInput = z.infer<typeof updateVetSchema>;
