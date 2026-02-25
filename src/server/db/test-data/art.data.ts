import { Art, IllustrationArt, WritingArt } from '@/entities/Art';
import { artistTestIds } from './artist.data';
import { ImageBySize } from '@/entities/Image';

export const artTestIds = {
  illustrationArt1: 'art/0000000001',
  illustrationArt2: 'art/0000000002',
  illustrationArt3: 'art/0000000003',
  writingArt4: 'art/0000000004',
};

function defaultIllustrationArt(image: ImageBySize, id: string, artistId: string): IllustrationArt {
  return {
    id,
    type: 'illustration',
    image,
    artistId,
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
    aIGenerated: false,
  };
}

function defaultWritingArt(id: string, artistId: string): WritingArt {
  return {
    id,
    type: 'writing',
    markdown: '# Example Writing Art\n\nThis is some example writing art content.',
    artistId,
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
    aIGenerated: false,
  };
}

// @TODO: Replace imageUrl with storage URLs; one for each size that was uploaded
export function getExampleArt1(image: ImageBySize): IllustrationArt {
  return {
    ...defaultIllustrationArt(image, artTestIds.illustrationArt1, artistTestIds.artist1),
  };
}

export function getExampleArt2(image: ImageBySize): IllustrationArt {
  return {
    ...defaultIllustrationArt(image, artTestIds.illustrationArt2, artistTestIds.artist1),
  };
}

export function getExampleArt3(image: ImageBySize): Art {
  return {
    ...defaultIllustrationArt(image, artTestIds.illustrationArt3, artistTestIds.artist2),
  };
}

export function getExampleArt4(): Art {
  return {
    ...defaultWritingArt(artTestIds.writingArt4, artistTestIds.artist3),
  };
}

