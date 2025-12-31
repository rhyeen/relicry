import { StoredApex } from '@/entities/Apex';
import { artTestIds } from './art.data';
import { artistTestIds } from './artist.data';

export const apexTestIds = {
  apex1: 'ax/111111',
  apex2: 'ax/222222',
  apex3: 'ax/333333',
};

export function getDefaultApex(
  id: string,
  title: string,
  artId?: string,
  artistId?: string,
): StoredApex {
  return {
    id,
    season: 1,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
    revealed: {
      title,
      health: { from: 50, to: 100 },
      illustration: {
        artId: artId || artTestIds.illustrationArt1,
        artistId: artistId || artistTestIds.artist1,
      },
      effects: [],
    },
    hidden: {
      health: { from: 50, to: 100 },
      effects: [],
    },
  };
}

export function getExampleApex1(): StoredApex {
  return {
    ...getDefaultApex(apexTestIds.apex1, 'Example Apex 1', artTestIds.illustrationArt1, artistTestIds.artist1),
  };
}

export function getExampleApex2(): StoredApex {
  return {
    ...getDefaultApex(apexTestIds.apex2, 'Example Apex 2', artTestIds.illustrationArt2, artistTestIds.artist2),
  };
}

export function getExampleApex3(): StoredApex {
  return {
    ...getDefaultApex(apexTestIds.apex3, 'Example Apex 3', artTestIds.illustrationArt3, artistTestIds.artist3),
  };
}