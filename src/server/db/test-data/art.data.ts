import { Art, IllustrationArt, WritingArt } from '@/entities/Art';
import { artistTestIds } from './artist.data';

export const artTestIds = {
  illustrationArt1: 'art/1111111111',
  illustrationArt2: 'art/1111111112',
  illustrationArt3: 'art/1111111113',
  writingArt4: 'art/1111111114',
};

function defaultIllustrationArt(id: string, artistId: string): IllustrationArt {
  return {
    id,
    type: 'illustration',
    imageUrl: 'https://fastly.picsum.photos/id/415/600/900.jpg?hmac=Z2Cski6viZ2maN9WNnVaf53djeBSIo4vMBoVzP4LShE',
    artistId,
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
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
  };
}

export function getExampleArt1(): IllustrationArt {
  return {
    ...defaultIllustrationArt(artTestIds.illustrationArt1, artistTestIds.artist1),
  };
}

export function getExampleArt2(): IllustrationArt {
  return {
    ...defaultIllustrationArt(artTestIds.illustrationArt2, artistTestIds.artist1),
  };
}

export function getExampleArt3(): Art {
  return {
    ...defaultIllustrationArt(artTestIds.illustrationArt3, artistTestIds.artist2),
  };
}

export function getExampleArt4(): Art {
  return {
    ...defaultWritingArt(artTestIds.writingArt4, artistTestIds.artist3),
  };
}

