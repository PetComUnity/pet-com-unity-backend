import { cloudinary } from '../config/cloudinary';
import { PetDocumentModel } from '../models/petDocument.model';
import { asyncHandler } from '../utils/async-handler';
import type { AuthRequest } from '../middlewares/auth.middleware';

type UploadType = 'public' | 'private' | 'document' | 'avatar';

const FOLDER_MAP: Record<UploadType, string> = {
  public: 'pet-avatars/public',
  private: 'pet-avatars/private',
  document: 'documents',
  avatar: 'user-avatars/private',
};

function isValidUploadType(value: unknown): value is UploadType {
  return (
    value === 'public' ||
    value === 'private' ||
    value === 'document' ||
    value === 'avatar'
  );
}

function getUploadFolder(type: UploadType, userId: string): string {
  if (type === 'avatar') {
    return `${FOLDER_MAP.avatar}/${userId}`;
  }

  return FOLDER_MAP[type];
}

export const uploadImageController = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No image file provided' });
    return;
  }

  const type = req.body.type;

  if (!isValidUploadType(type)) {
    res
      .status(400)
      .json({
        success: false,
        message: 'Invalid upload type. Use: public | private | document | avatar',
      });
    return;
  }

  const folder = getUploadFolder(type, req.userId!);

  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
    quality: 'auto',
    fetch_format: 'auto',
  });

  if (type === 'public') {
    res.status(200).json({ success: true, data: { url: result.secure_url } });
  } else {
    res.status(200).json({ success: true, data: { fileId: result.public_id } });
  }
});

export const deleteOrphanDocumentController = asyncHandler(
  async (req: AuthRequest, res) => {
    const fileId = req.params.fileId as string;
    const publicId = fileId.replace(/--/g, '/');

    if (!publicId.startsWith('documents/')) {
      res
        .status(400)
        .json({ success: false, message: 'Invalid file reference' });
      return;
    }

    const inUse = await PetDocumentModel.exists({ fileId: publicId });
    if (inUse) {
      res
        .status(409)
        .json({ success: false, message: 'File is already in use' });
      return;
    }

    await Promise.allSettled([
      cloudinary.uploader.destroy(publicId, { resource_type: 'image' }),
      cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }),
    ]);

    res.status(200).json({ success: true, message: 'File removed' });
  },
);

export const uploadDocumentController = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file provided' });
    return;
  }

  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: FOLDER_MAP.document,
    resource_type: 'auto',
  });

  res.status(200).json({
    success: true,
    data: {
      fileId: result.public_id,
      mimeType: req.file.mimetype,
      secureUrl: result.secure_url,
    },
  });
});
