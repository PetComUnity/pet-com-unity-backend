import { cloudinary } from '../config/cloudinary';

function parseCloudinaryUrl(url: string): { publicId: string; resourceType: string } | null {
  const m = url.match(/https:\/\/res\.cloudinary\.com\/[^/]+\/([^/]+)\/upload\/(?:v\d+\/)?(.+)$/);
  if (!m) return null;
  const resourceType = m[1];
  const full = m[2];
  const lastDot = full.lastIndexOf('.');
  const lastSlash = full.lastIndexOf('/');
  const hasExt = lastDot > lastSlash && lastDot > 0;
  return {
    resourceType,
    publicId: hasExt ? full.slice(0, lastDot) : full,
  };
}

export async function deleteCloudinaryAsset(fileIdOrUrl: string): Promise<void> {
  if (fileIdOrUrl.startsWith('https://')) {
    const parsed = parseCloudinaryUrl(fileIdOrUrl);
    if (!parsed) return;
    await cloudinary.uploader.destroy(parsed.publicId, {
      resource_type: parsed.resourceType as 'image' | 'video' | 'raw',
    });
    return;
  }

  await cloudinary.uploader.destroy(fileIdOrUrl, { resource_type: 'image' });
}
