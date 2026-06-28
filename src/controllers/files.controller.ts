import https from 'https';
import type { Response } from 'express';
import { cloudinary } from '../config/cloudinary';
import { PetModel } from '../models/pet.model';
import { PetDocumentModel } from '../models/petDocument.model';
import { UserModel } from '../models/user.model';
import { asyncHandler } from '../utils/async-handler';
import type { AuthRequest } from '../middlewares/auth.middleware';

function buildDownloadUrl(
  resourceType: string,
  publicId: string,
  format: string | undefined,
): string {
  return (cloudinary.utils as any).private_download_url(
    publicId,
    format ?? '',
    { resource_type: resourceType, type: 'upload' },
  );
}

function parseSecureUrl(
  secureUrl: string,
): { resourceType: string; publicId: string; format?: string } | null {
  const m = secureUrl.match(
    /https:\/\/res\.cloudinary\.com\/[^/]+\/([^/]+)\/upload\/(?:v\d+\/)?(.+)$/,
  );
  if (!m) return null;
  const resourceType = m[1];
  const full = m[2];
  const lastSlash = full.lastIndexOf('/');
  const lastDot = full.lastIndexOf('.');
  const hasExt = lastDot > lastSlash && lastDot > 0;
  return {
    resourceType,
    publicId: hasExt ? full.slice(0, lastDot) : full,
    format: hasExt ? full.slice(lastDot + 1) : undefined,
  };
}

function proxyDownload(downloadUrl: string, res: Response): void {
  https
    .get(downloadUrl, (upstream) => {
      const status = upstream.statusCode ?? 0;

      if (status >= 400) {
        upstream.resume();
        res
          .status(502)
          .json({
            success: false,
            message: 'Could not retrieve file from storage',
          });
        return;
      }

      res.setHeader(
        'Content-Type',
        upstream.headers['content-type'] ?? 'application/octet-stream',
      );
      if (upstream.headers['content-length']) {
        res.setHeader('Content-Length', upstream.headers['content-length']);
      }
      res.setHeader('Cache-Control', 'private, max-age=300');
      upstream.pipe(res);
    })
    .on('error', (err) => {
      if (!res.headersSent) {
        res
          .status(500)
          .json({ success: false, message: 'Could not load file' });
      }
    });
}

export const getPrivateFileController = asyncHandler(
  async (req: AuthRequest, res) => {
    const { fileId } = req.params;
    const userId = req.userId;

    const publicId = fileId.replace(/--/g, '/');

    if (publicId.startsWith('documents/')) {
      if (!userId) {
        res
          .status(401)
          .json({ success: false, message: 'Authentication required' });
        return;
      }
      const doc = await PetDocumentModel.findOne({ fileId: publicId });
      if (!doc) {
        res.status(404).json({ success: false, message: 'File not found' });
        return;
      }
      if (doc.ownerId !== userId) {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      const parsed = doc.secureUrl ? parseSecureUrl(doc.secureUrl) : null;
      let resourceType = parsed?.resourceType ?? 'image';
      const docPublicId = parsed?.publicId ?? publicId;
      const format = parsed?.format;

      if (!parsed) {
        const mime = doc.mimeType ?? '';
        if (mime && !mime.startsWith('image/') && mime !== 'application/pdf') {
          resourceType = 'raw';
        }
      }

      proxyDownload(buildDownloadUrl(resourceType, docPublicId, format), res);
      return;
    }

    const [pet, user] = await Promise.all([
      PetModel.findOne({ imageFileId: publicId }).lean(),
      userId
        ? UserModel.findOne({ _id: userId, avatarFileId: publicId }).lean()
        : Promise.resolve(null),
    ]);

    if (!pet && !user) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    if (pet) {
      const isPublicPet = pet.isAdoptable || pet.isLost;
      const isOwner = userId && pet.ownerId === userId;
      const isClinicVerifier = req.role === 'vet' || req.role === 'admin';
      if (!isPublicPet && !isOwner && !isClinicVerifier && !user) {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }
    } else if (!userId) {
      res
        .status(401)
        .json({ success: false, message: 'Authentication required' });
      return;
    }

    proxyDownload(buildDownloadUrl('image', publicId, undefined), res);
  },
);
