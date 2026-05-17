import 'server-only';

import { Artist } from '@/entities/Artist';
import { Event } from '@/entities/Event';
import { Herald } from '@/entities/Herald';
import { ImageSize, ImageStorage } from '@/entities/Image';
import { User } from '@/entities/User';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { getArtist } from '@/server/cache/artist.cache';
import { getEvent } from '@/server/cache/event.cache';
import { getHerald, getHeralds } from '@/server/cache/herald.cache';
import { getUser } from '@/server/cache/user.cache';
import { ArtistDB } from '@/server/db/artist.db';
import { EventDB } from '@/server/db/event.db';
import { UserDB } from '@/server/db/user.db';

export type ResolvedHeraldImage =
  | { type: 'url'; url: string }
  | { type: 'stored'; image: ImageStorage };

export type HeraldView = {
  herald: Herald;
  user: User | null;
  artist: Artist | null;
  event: Event | null;
  displayName: string;
  profileImage: ResolvedHeraldImage | null;
  bannerImageUrl: string | null;
  summary: string | null;
  promotedItemIds: string[];
};

export type HeraldEditorOption = {
  label: string;
  value: string;
};

export type HeraldEventEditorOption = HeraldEditorOption & {
  running: Event['running'];
};

export type HeraldEditorOptions = {
  users: HeraldEditorOption[];
  artists: HeraldEditorOption[];
  events: HeraldEventEditorOption[];
};

export function getHeraldDisplayName(
  herald: Herald,
  artist: Artist | null,
  user: User | null,
): string {
  const overrideName = herald.override.name?.trim();
  if (overrideName) return overrideName;

  const artistName = herald.artistId ? artist?.name.trim() : '';
  if (artistName) return artistName;

  const userDisplayName = user?.displayName.trim();
  if (userDisplayName) return userDisplayName;

  return herald.id;
}

export async function getHeraldView(id: string): Promise<HeraldView | null> {
  const herald = await getHerald(id);
  if (!herald) return null;

  const [user, artist, event] = await Promise.all([
    getUser(herald.userId),
    herald.artistId ? getArtist(herald.artistId) : Promise.resolve(null),
    getEvent(herald.eventId),
  ]);

  return resolveHeraldView(herald, user, artist, event);
}

export async function getHeraldViews(): Promise<HeraldView[]> {
  const heralds = (await getHeralds()).filter((herald) => herald.archivedAt === null);
  const views = await Promise.all(heralds.map(async (herald) => {
    const [user, artist, event] = await Promise.all([
      getUser(herald.userId),
      herald.artistId ? getArtist(herald.artistId) : Promise.resolve(null),
      getEvent(herald.eventId),
    ]);

    return resolveHeraldView(herald, user, artist, event);
  }));

  return views.sort((first, second) => {
    const firstEventTime = first.event?.running.from.getTime() ?? Number.MAX_SAFE_INTEGER;
    const secondEventTime = second.event?.running.from.getTime() ?? Number.MAX_SAFE_INTEGER;
    if (firstEventTime !== secondEventTime) return firstEventTime - secondEventTime;
    return first.displayName.localeCompare(second.displayName);
  });
}

export async function getHeraldEditorOptions(): Promise<HeraldEditorOptions> {
  const firestoreAdmin = getFirestoreAdmin();
  const [users, artists, events] = await Promise.all([
    new UserDB(firestoreAdmin).getBy({
      where: [],
      sortBy: { field: 'displayName', direction: 'asc' },
      limit: 500,
    }),
    new ArtistDB(firestoreAdmin).getBy({
      where: [],
      sortBy: { field: 'name', direction: 'asc' },
      limit: 500,
    }),
    new EventDB(firestoreAdmin).getBy({
      where: [],
      sortBy: { field: 'running.from', direction: 'desc' },
      limit: 100,
    }),
  ]);

  return {
    users: users
      .filter((user) => user.archivedAt === null)
      .map((user) => ({
        label: `${user.displayName || user.email || user.id} (${user.id})`,
        value: user.id,
      })),
    artists: artists
      .filter((artist) => artist.archivedAt === null)
      .map((artist) => ({
        label: `${artist.name || artist.id} (${artist.id})`,
        value: artist.id,
      })),
    events: events
      .filter((event) => event.archivedAt === null)
      .map((event) => ({
        label: `${event.title || event.id} (${formatDateRange(event.running.from, event.running.to)})`,
        value: event.id,
        running: event.running,
      })),
  };
}

function resolveHeraldView(
  herald: Herald,
  user: User | null,
  artist: Artist | null,
  event: Event | null
): HeraldView {
  return {
    herald,
    user,
    artist,
    event,
    displayName: getHeraldDisplayName(herald, artist, user),
    profileImage: getProfileImage(herald, user),
    bannerImageUrl: herald.override.bannerImageUrl || artist?.bannerImageUrl || null,
    summary: herald.override.summary || artist?.summary || null,
    promotedItemIds: herald.override.promotedItemIds || artist?.promotedItemIds || [],
  };
}

function getProfileImage(herald: Herald, user: User | null): ResolvedHeraldImage | null {
  if (herald.override.profileImageUrl) {
    return { type: 'url', url: herald.override.profileImageUrl };
  }

  const storedImage = user?.profileImage?.[ImageSize.Thumb] ?? user?.profileImage?.[ImageSize.Banner];
  return storedImage ? { type: 'stored', image: storedImage } : null;
}

function formatDateRange(from: Date, to: Date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (from.toDateString() === to.toDateString()) {
    return formatter.format(from);
  }

  return `${formatter.format(from)} to ${formatter.format(to)}`;
}
