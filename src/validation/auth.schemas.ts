import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),

  email: z.string().email('Invalid email format'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),

  role: z.enum(['owner', 'vet', 'shelter', 'admin'], {
    error: 'Role must be one of: owner, vet, shelter, admin',
  }),

  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,15}$/, 'Invalid phone number format')
    .optional(),

  city: z.string().max(100, 'City name is too long').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),

  password: z.string().min(1, 'Password is required'),
});

export const updateCurrentUserSchema = registerSchema
  .pick({
    name: true,
    email: true,
    phone: true,
    city: true,
  })
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one profile field is required',
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateCurrentUserInput = z.infer<typeof updateCurrentUserSchema>;
