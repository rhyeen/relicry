import { Artist } from '@/entities/Artist';
import { userTestIds } from './user.data';

export const artistTestIds = {
  artist1: 'ast/0000000001',
  artist2: 'ast/0000000002',
  artist3: 'ast/0000000003',
};

function defaultArtist(id: string, userId: string, name: string): Artist {
  return {
    id,
    userId,
    name,
    promotedArtIds: [],
    promotedItemIds: [],
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
  };
}

export function getExampleArtist1(): Artist {
  return {
    ...defaultArtist(artistTestIds.artist1, userTestIds.user1, 'Artist One'),
  };
}

export function getExampleArtist2(): Artist {
  return {
    ...defaultArtist(artistTestIds.artist2, userTestIds.user2, 'Artist Two'),
  };
}

export function getExampleArtist3(): Artist {
  return {
    ...defaultArtist(artistTestIds.artist3, userTestIds.user3, 'Artist Three'),
  };
}