export enum ImageSize {
  Thumb = 'thumb',
  Banner = 'banner',
  Card = 'card',
  CardPreview = 'preview',
  CardFull = 'full',
  Custom = 'custom',
}

export const ImageSizeContext: {
  [key in ImageSize]: { w: number; h: number; quality: number }
} = {
  [ImageSize.Thumb]: { w: 100, h: 100, quality: 82 },
  [ImageSize.Banner]: { w: 1920, h: 480, quality: 82 },
  [ImageSize.CardPreview]: { w: 300, h: 300, quality: 62 },
  [ImageSize.Card]: { w: 470, h: 660, quality: 82 },
  [ImageSize.CardFull]: { w: 1536, h: 1536, quality: 100 },
  [ImageSize.Custom]: { w: 0, h: 0, quality: 82 },
};

export type ImageStorage = {
  path: string;
  url?: string;
}

export type ImageBySize = { [key in ImageSize]?: ImageStorage };
export type ImageExtension = 'webp' | 'jpg' | 'png';

export function getImageWidth(size: ImageSize | { width: number; height: number }): number {
  if (typeof size === 'object') {
    return size.width;
  }
  return ImageSizeContext[size].w;
}

export function getImageHeight(size: ImageSize | { width: number; height: number }): number {
  if (typeof size === 'object') {
    return size.height;
  }
  return ImageSizeContext[size].h;
}
