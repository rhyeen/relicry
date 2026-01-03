import { ImageBySize, ImageSize, ImageSizeContext } from '@/entities/Image';
import { BucketLike } from '@/server/storage/file.storage';
import { ImageStorage } from '@/server/storage/image.storage';
import 'server-only';

import sharp from 'sharp';

/**
 * Creates a solid-color WebP image buffer.
 * @param opts.width image width in pixels
 * @param opts.height image height in pixels
 * @param opts.color can be '#RRGGBB' or '#RRGGBBAA' or a named color supported by sharp.
 * @param opts.quality webp quality 1-100 (default 82)
 */
async function makeSolidWebpBuffer(opts: {
  width: number;
  height: number;
  color: string;
  quality?: number;
}): Promise<Buffer> {
  const { width, height, color, quality = 82 } = opts;
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: color,
    },
  })
    .webp({ quality })
    .toBuffer();
}

export async function seedImage(params: {
  id: string;
  bucket?: BucketLike;
  color?: string;
  sizes?: ImageSize[];
}): Promise<ImageBySize> {
  const { bucket, id, color = '#BB4499', sizes = Object.values(ImageSize) } = params;

  const buffers = await Promise.all(
    sizes.map(async (size) => {
      const context = ImageSizeContext[size];
      if (!context.w || context.w <= 0) {
        context.w = Math.floor(Math.random() * 800 + 200);
      }
      if (!context.h || context.h <= 0) {
        context.h = Math.floor(Math.random() * 800 + 200);
      }
      console.log(`Seeding image ${id} at size ${size} (${context.w}x${context.h})`);
      const buffer = await makeSolidWebpBuffer({
        width: context.w,
        height: context.h,
        color,
        quality: context.quality,
      });
      return { size, buffer };
    }),
  );

  const imageStorage = new ImageStorage(bucket);
  return await imageStorage.upload(id, buffers, 'webp');
}
