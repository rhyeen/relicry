import 'server-only';

import { ImageExtension, ImageSize } from '@/entities/Image';
import { ImageStorage } from '@/server/storage/image.storage';
import { authenticateUser, BadRequest, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';
import { randomUUID } from 'crypto';

const ALLOWED_PROFILE_IMAGE_SIZES = new Set<string>([
  ImageSize.Banner,
  ImageSize.Thumb,
]);

function getExtensionFromFile(file: File): ImageExtension {
  const name = file.name.toLowerCase();
  if (name.endsWith('.png')) return 'png';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'jpg';
  if (name.endsWith('.webp')) return 'webp';
  const type = file.type.toLowerCase();
  if (type === 'image/png') return 'png';
  if (type === 'image/jpeg') return 'jpg';
  return 'webp';
}

export async function POST(req: Request) {
  try {
    await authenticateUser(req);

    const form = await req.formData();
    const keysRaw = form.get('keys');
    if (!keysRaw) {
      throw new BadRequest('Missing form field: keys');
    }

    const parsedKeys = JSON.parse(String(keysRaw));
    if (!Array.isArray(parsedKeys)) {
      throw new BadRequest('Image keys must be an array.');
    }

    const buffers: { size: ImageSize; buffer: Buffer; extension: ImageExtension }[] = [];
    for (const rawKey of parsedKeys) {
      const key = String(rawKey);
      if (!ALLOWED_PROFILE_IMAGE_SIZES.has(key)) {
        throw new BadRequest(`Unsupported profile image key: ${key}`);
      }
      const file = form.get(key);
      if (!(file instanceof File)) {
        throw new BadRequest(`Missing file for key: ${key}`);
      }
      buffers.push({
        size: key as ImageSize,
        buffer: Buffer.from(await file.arrayBuffer()),
        extension: getExtensionFromFile(file),
      });
    }

    if (buffers.length === 0) {
      throw new BadRequest('No profile images provided.');
    }

    const imageStorage = new ImageStorage();
    const image = await imageStorage.upload(
      randomUUID(),
      buffers.map(({ size, buffer }) => ({ size, buffer })),
      buffers[0]?.extension ?? 'webp',
      false,
    );

    return handleJsonResponse({ image });
  } catch (e) {
    return handleRouteError(e);
  }
}
