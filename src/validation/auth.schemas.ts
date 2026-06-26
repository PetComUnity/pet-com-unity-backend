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

  website: z
    .string()
    .url('Invalid website URL')
    .max(2048, 'Website URL is too long')
    .optional(),

  socialMediaLink: z
    .string()
    .url('Invalid social media link URL')
    .max(2048, 'Social media link URL is too long')
    .optional(),

  address: z.string().max(250, 'Address is too long').optional(),

  registrationNumber: z
    .string()
    .trim()
    .max(100, 'Registration number is too long')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),

  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),

    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long'),
  })
  .refine((payload) => payload.currentPassword !== payload.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

const updateCurrentUserFieldsSchema = registerSchema
  .pick({
    name: true,
    email: true,
    city: true,
    website: true,
    socialMediaLink: true,
    address: true,
  })
  .extend({
    phone: z
      .string()
      .refine((v) => v === '' || /^\+?[\d\s\-()]{7,15}$/.test(v), {
        message: 'Invalid phone number format',
      })
      .optional(),
    avatarFileId: z.string().min(1).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
  });

export const updateCurrentUserSchema = updateCurrentUserFieldsSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one profile field is required',
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateCurrentUserInput = z.infer<typeof updateCurrentUserSchema>;
