import { z } from 'zod';

export const addPetDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(200, 'Name is too long'),
  issuedDate: z.string().min(1, 'Issued date is required'),
  fileId: z.string().min(1, 'File ID is required'),
  mimeType: z.string().optional(),
  secureUrl: z.string().optional(),
});

export type AddPetDocumentInput = z.infer<typeof addPetDocumentSchema>;
