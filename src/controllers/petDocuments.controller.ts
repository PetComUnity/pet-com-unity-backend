import { PetModel } from '../models/pet.model';
import { asyncHandler } from '../utils/async-handler';
import { createAppError, sendSuccess } from '../utils/api-response';
import { addPetDocumentSchema } from '../validation/petDocument.schemas';
import { petDocumentsRepository } from '../repositories/petDocuments.repository';
import type { AuthRequest } from '../middlewares/auth.middleware';

async function requirePetOwner(petId: string, userId: string) {
  const pet = await PetModel.findById(petId).lean();
  if (!pet) throw createAppError('Pet not found', 404);
  if (pet.ownerId !== userId) throw createAppError('Access denied', 403);
}

export const getPetDocuments = asyncHandler(async (req: AuthRequest, res) => {
  const { petId } = req.params;
  await requirePetOwner(petId, req.userId!);
  const documents = await petDocumentsRepository.getByPetId(petId, req.userId!);
  sendSuccess(res, 200, 'Documents fetched successfully', documents);
});

export const addPetDocument = asyncHandler(async (req: AuthRequest, res) => {
  const { petId } = req.params;
  await requirePetOwner(petId, req.userId!);

  const result = addPetDocumentSchema.safeParse(req.body);
  if (!result.success) {
    throw createAppError(result.error.issues[0]?.message ?? 'Invalid request body', 400);
  }

  const document = await petDocumentsRepository.create(petId, req.userId!, result.data);
  sendSuccess(res, 201, 'Document added successfully', document);
});

export const deletePetDocument = asyncHandler(async (req: AuthRequest, res) => {
  const { petId, docId } = req.params;
  await requirePetOwner(petId, req.userId!);

  const existing = await petDocumentsRepository.getById(docId);
  if (!existing) throw createAppError('Document not found', 404);
  if (existing.ownerId !== req.userId) throw createAppError('Access denied', 403);

  const deleted = await petDocumentsRepository.delete(docId);
  sendSuccess(res, 200, 'Document deleted successfully', deleted);
});
