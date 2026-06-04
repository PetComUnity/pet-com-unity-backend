import { cloudinary } from '../config/cloudinary';
import { asyncHandler } from '../utils/async-handler';

type UploadType = 'public' | 'private' | 'document';

const FOLDER_MAP: Record<UploadType, string> = {
  public: 'pet-avatars/public',
  private: 'pet-avatars/private',
  document: 'documents',
};

function isValidUploadType(value: unknown): value is UploadType {
  return value === 'public' || value === 'private' || value === 'document';
}

export const uploadImageController = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No image file provided' });
    return;
  }

  const type = req.body.type;

  if (!isValidUploadType(type)) {
    res.status(400).json({ success: false, message: 'Invalid upload type. Use: public | private | document' });
    return;
  }

  const folder = FOLDER_MAP[type];

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
