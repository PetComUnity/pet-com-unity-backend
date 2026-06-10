import { cloudinary } from '../config/cloudinary';
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
    res.status(400).json({ success: false, message: 'Invalid upload type. Use: public | private | document | avatar' });
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
