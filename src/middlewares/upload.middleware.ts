import multer from 'multer';

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_MIME_TYPES = [
  // Images
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  // PDF
  'application/pdf',
  // Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Plain text
  'text/plain',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;    // 5 MB for avatars
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB for documents

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, callback) => {
    if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Only JPEG, PNG, WebP and GIF images are allowed'));
    }
  },
}).single('image');

export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: (_req, file, callback) => {
    if (ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Allowed formats: images (JPEG, PNG, WebP, GIF), PDF, Word (.doc/.docx), Excel (.xls/.xlsx), plain text (.txt)'));
    }
  },
}).single('file');
