import https from 'https';
import { cloudinary } from '../config/cloudinary';
import { PetModel } from '../models/pet.model';
import { UserModel } from '../models/user.model';
import { asyncHandler } from '../utils/async-handler';
import type { AuthRequest } from '../middlewares/auth.middleware';

export const getPrivateFileController = asyncHandler(async (req: AuthRequest, res) => {
  const { fileId } = req.params;
  const userId = req.userId!;

  const publicId = fileId.replace(/--/g, '/');

  const [pet, user] = await Promise.all([
    PetModel.findOne({ imageFileId: publicId }).lean(),
    UserModel.findOne({ _id: userId, avatarFileId: publicId }).lean(),
  ]);

  if (!pet && !user) {
    res.status(404).json({ success: false, message: 'File not found' });
    return;
  }

  if (pet && pet.ownerId !== userId && !user) {
    res.status(403).json({ success: false, message: 'Access denied' });
    return;
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
