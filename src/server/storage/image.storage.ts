import 'server-only';

import { BucketLike, FileStorage } from './file.storage';
import { ImageSize, ImageExtension, ImageBySize } from '@/entities/Image';

export class ImageStorage extends FileStorage {
  constructor(bucket?: BucketLike) {
    super(bucket);
  }

  public getPath(id: string, size: ImageSize, extension?: ImageExtension): string {
    return `images/${id}/${size}.${this.getExtension(extension)}`;
  }

  protected getExtension(extension?: ImageExtension): ImageExtension {
    return extension || 'webp';
  }

  public async upload(
    id: string,
    imageSizes: {
      size: ImageSize;
      buffer: Buffer;
    }[],
    extension?: ImageExtension,
    authenticatedAccess?: boolean,
  ): Promise<ImageBySize> {
    const paths: ImageBySize = {};
    for (const imageSize of imageSizes) {
      const path = this.getPath(id, imageSize.size, extension);
      // @NOTE: Intentionally not using await Promise.all to limit concurrent uploads
      const url = await this.uploadFile(
        path,
        imageSize.buffer,
        true,
        `image/${this.getExtension(extension)}`,
        authenticatedAccess !== true,
      );
      paths[imageSize.size] = { path, url : url || undefined };
    }
    return paths;
  }
}