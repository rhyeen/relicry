import { AdminRole } from '@/entities/AdminRole';
import { Artist, ArtistTag, getArtistId } from '@/entities/Artist';
import { ImageSize, ImageStorage } from '@/entities/Image';
import { getUserId } from '@/entities/User';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { invalidateArtistNow } from '@/server/cache/artist.cache';
import { ArtistDB } from '@/server/db/artist.db';
import { UserDB } from '@/server/db/user.db';
import { authenticateUser, BadRequest, handleJsonResponse, handleRouteError, NotFound } from '@/server/routeHelpers';

type ArtistEditorOption = {
  label: string;
  value: string;
};

function asDate(value: unknown): Date | null {
  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? null : date;
}

function cleanString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(cleanString).filter((item): item is string => !!item))];
}

function cleanArtistTags(value: unknown): ArtistTag[] {
  const tags = cleanStringArray(value);
  const allowedTags = new Set<string>(Object.values(ArtistTag));
  return tags.filter((tag): tag is ArtistTag => allowedTags.has(tag));
}

function validateImageStorage(value: unknown): ImageStorage | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const input = value as Partial<ImageStorage>;
  if (typeof input.path !== 'string') return undefined;
  return {
    path: input.path,
    url: typeof input.url === 'string' ? input.url : undefined,
  };
}

function validateBannerImage(value: unknown): Artist['bannerImage'] | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const input = value as Record<string, unknown>;
  const banner = validateImageStorage(input[ImageSize.Banner]);
  return banner ? { [ImageSize.Banner]: banner } : undefined;
}

async function getArtistEditorOptions(): Promise<{ users: ArtistEditorOption[] }> {
  const users = await new UserDB(getFirestoreAdmin()).getBy({
    where: [],
    sortBy: { field: 'displayName', direction: 'asc' },
    limit: 500,
  });

  return {
    users: users
      .filter((user) => user.archivedAt === null)
      .map((user) => ({
        label: `${user.displayName || user.email || user.id} (${user.id})`,
        value: user.id,
      })),
  };
}

export async function GET(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.SuperAdmin,
    });
    const url = new URL(req.url);
    if (url.searchParams.get('options') === '1') {
      const options = await getArtistEditorOptions();
      return handleJsonResponse({ options });
    }

    const db = new ArtistDB(getFirestoreAdmin());
    const artists = await db.getBy({
      where: [],
      sortBy: { field: 'name', direction: 'asc' },
    });
    return handleJsonResponse({ artists });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.SuperAdmin,
    });
    const body = await req.json();
    const inputArtist = body.artist as Artist;
    if (!inputArtist || typeof inputArtist !== 'object') {
      throw new BadRequest('Artist payload is required.');
    }

    const firestoreAdmin = getFirestoreAdmin();
    const db = new ArtistDB(firestoreAdmin);
    const userDB = new UserDB(firestoreAdmin);
    const userId = cleanString(inputArtist.userId) ? getUserId(inputArtist.userId) : '';

    if (userId) {
      const user = await userDB.getFromParts(userId);
      if (!user || user.archivedAt) {
        throw new NotFound('User', `Artist user not found: ${userId}`);
      }
    }

    const name = cleanString(inputArtist.name);
    if (!name) {
      throw new BadRequest('Artist name is required.');
    }

    const now = new Date();
    const id = cleanString(inputArtist.id) ? getArtistId(inputArtist.id) : await db.generateId();
    const bannerImage = validateBannerImage(inputArtist.bannerImage);
    const artist: Artist = {
      ...inputArtist,
      id,
      userId,
      name,
      profileImageUrl: cleanString(inputArtist.profileImageUrl),
      bannerImageUrl: cleanString(inputArtist.bannerImageUrl) ?? bannerImage?.[ImageSize.Banner]?.url,
      bannerImage,
      summary: cleanString(inputArtist.summary),
      promotedArtIds: cleanStringArray(inputArtist.promotedArtIds),
      promotedItemIds: cleanStringArray(inputArtist.promotedItemIds),
      tags: cleanArtistTags(inputArtist.tags),
      createdAt: asDate(inputArtist.createdAt) ?? now,
      updatedAt: now,
      archivedAt: inputArtist.archivedAt ? (asDate(inputArtist.archivedAt) ?? now) : null,
    };

    const updatedArtist = await db.set(artist);
    await invalidateArtistNow(updatedArtist.id);
    return handleJsonResponse({ artist: updatedArtist });
  } catch (e) {
    return handleRouteError(e);
  }
}
