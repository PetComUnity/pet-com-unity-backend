import https from 'https';
import { cloudinary } from '../config/cloudinary';
import { PetModel } from '../models/pet.model';
import { PetDocumentModel } from '../models/petDocument.model';
import { asyncHandler } from '../utils/async-handler';
import type { AuthRequest } from '../middlewares/auth.middleware';

export const getPrivateFileController = asyncHandler(async (req: AuthRequest, res) => {
  const { fileId } = req.params;
  const userId = req.userId!;

  const publicId = fileId.replace(/--/g, '/');

  const pet = await PetModel.findOne({ imageFileId: publicId });
  if (pet) {
    if (pet.ownerId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }
  } else {
    const doc = await PetDocumentModel.findOne({ fileId: publicId });
    if (!doc) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }
    if (doc.ownerId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }
  }

  const fileUrl = cloudinary.url(publicId, { secure: true, sign_url: false });

  https
    .get(fileUrl, (stream) => {
      res.setHeader('Content-Type', stream.headers['content-type'] ?? 'image/jpeg');
      res.setHeader('Cache-Control', 'private, max-age=3600');
      stream.pipe(res);
    })
    .on('error', () => {
      res.status(500).json({ success: false, message: 'Could not load file' });
    });
});
