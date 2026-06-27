import { z } from 'zod';

const identityString = z
  .string()
  .trim()
  .min(1, 'Microchip number is required')
  .max(80, 'Microchip number is too long');

export const lookupPetByMicrochipQuerySchema = z.object({
  microchipId: identityString,
});

export const submitPetVerificationSchema = z.object({
  microchipId: identityString,
  result: z.enum(['verified', 'pending', 'rejected']),
  microchipMatched: z.boolean(),
  passportMatched: z.boolean(),
  visualCheckPassed: z.boolean(),
  note: z.string().trim().max(1000, 'Note is too long').optional(),
  doctorId: z.string().trim().max(100, 'Doctor ID is too long').optional(),
  doctorName: z.string().trim().max(120, 'Doctor name is too long').optional(),
});

export type LookupPetByMicrochipQuery = z.infer<
  typeof lookupPetByMicrochipQuerySchema
>;
export type SubmitPetVerificationInput = z.infer<
  typeof submitPetVerificationSchema
>;
