import 'server-only';

import { Artist } from '@/entities/Artist';
import { User } from '@/entities/User';
import { getUser } from '@/server/cache/user.cache';

export async function getArtistUser(artist: Artist): Promise<User | null> {
  if (!artist.userId) return null;

  const linkedUser = await getUser(artist.userId);
  if (linkedUser?.archivedAt === null) {
    return linkedUser;
  }

  return null;
}

export async function getArtistUsers(artists: Artist[]): Promise<Map<string, User>> {
  const userIds = [...new Set(artists.map((artist) => artist.userId).filter(Boolean))];
  const users = await Promise.all(userIds.map(async (userId) => [userId, await getUser(userId)] as const));
  const usersById = new Map(
    users.filter((entry): entry is [string, User] => !!entry[1] && entry[1].archivedAt === null)
  );

  const userEntries = artists.map((artist) => {
    const user = usersById.get(artist.userId) ?? null;
    return [artist.id, user] as const;
  });

  return new Map(userEntries.filter((entry): entry is [string, User] => !!entry[1]));
}
