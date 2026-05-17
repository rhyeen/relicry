import Link from 'next/link';
import { Suspense } from 'react';
import { connection } from 'next/server';
import AdminPageAction from '@/components/client/AdminPageAction';
import StoredImageSlot from '@/components/client/StoredImage.slot';
import DSAvatar from '@/components/ds/DSAvatar';
import DSButton from '@/components/ds/DSButton';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { AdminRole } from '@/entities/AdminRole';
import { Artist, ArtistTag } from '@/entities/Artist';
import { ImageSize } from '@/entities/Image';
import { User } from '@/entities/User';
import { buildArtQueryString } from '@/lib/artList';
import { getArtists } from '@/server/cache/artist.cache';
import { getUser } from '@/server/cache/user.cache';
import styles from './page.module.css';

export function generateMetadata() {
  return {
    title: 'Artists • Relicry',
    description: 'Artists contributing to the Relicry archive.',
  };
}

export default function ArtistsPage() {
  return (
    <DSPage>
      <DSSection.Card background="darkBrown" padding="thick">
        <DSSection.Heading>
          <DSText.Eyebrow>Artist archive</DSText.Eyebrow>
          <DSText.Heading as="h1" size="2xl">Artists</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body size="lg" tone="muted">
            Browse the illustrators, authors, and collaborators shaping Relicry art and lore.
          </DSText.Body>
        </DSSection.Text>
        <DSSection.Actions>
          <AdminPageAction href="/ast/new" label="New Artist" requiredRole={AdminRole.SuperAdmin} />
        </DSSection.Actions>
      </DSSection.Card>

      <Suspense fallback={<ArtistsLoading />}>
        <ArtistsPageData />
      </Suspense>
    </DSPage>
  );
}

function ArtistsLoading() {
  return (
    <DSSection.Card>
      <DSText.Body tone="muted">Loading artists...</DSText.Body>
    </DSSection.Card>
  );
}

async function ArtistsPageData() {
  await connection();
  const artists = await getArtists();
  const usersById = await getArtistUsers(artists);

  if (artists.length === 0) {
    return (
      <DSSection.Card>
        <DSText.Body tone="muted">No artists are available yet.</DSText.Body>
      </DSSection.Card>
    );
  }

  return (
    <DSSection>
      <div className={styles.grid}>
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} user={usersById.get(artist.userId) ?? null} />
        ))}
      </div>
    </DSSection>
  );
}

async function getArtistUsers(artists: Artist[]): Promise<Map<string, User>> {
  const userIds = [...new Set(artists.map((artist) => artist.userId).filter(Boolean))];
  const users = await Promise.all(userIds.map(async (userId) => [userId, await getUser(userId)] as const));
  return new Map(users.filter((entry): entry is [string, User] => !!entry[1]));
}

function ArtistCard({ artist, user }: Readonly<{ artist: Artist; user: User | null }>) {
  const tags = artist.tags ?? [];
  const artistHref = `/${artist.id}`;
  const artHref = `/art${buildArtQueryString({ artistId: artist.id })}`;
  const bannerImage = artist.bannerImage?.[ImageSize.Banner];

  return (
    <article className={styles.card}>
      <Link href={artistHref} className={styles.cardLink} aria-label={`View artist: ${artist.name}`} />
      <div className={styles.banner}>
        {bannerImage ? (
          <StoredImageSlot
            image={bannerImage}
            size={ImageSize.Banner}
            alt=""
            className={styles.bannerImage}
          />
        ) : artist.bannerImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artist.bannerImageUrl} alt="" className={styles.bannerImage} aria-hidden="true" />
        ) : null}
        <div className={styles.avatar}>
          {user ? (
            <DSAvatar user={user} size="fill" decorative variant="plain" />
          ) : artist.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={artist.profileImageUrl} alt="" className={styles.avatarImage} aria-hidden="true" />
          ) : (
            <span>{getArtistInitials(artist.name)}</span>
          )}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.badgeRow}>
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span key={tag} className={styles.badge}>{formatArtistTag(tag)}</span>
            ))
          ) : (
            <span className={styles.badge}>Artist</span>
          )}
        </div>
        <DSText.Heading as="h2" size="lg" className={styles.title}>
          {artist.name}
        </DSText.Heading>
        {artist.summary ? (
          <DSText.Body tone="muted" className={styles.summary}>{artist.summary}</DSText.Body>
        ) : (
          <DSText.Body tone="muted" className={styles.summary}>Relicry archive contributor.</DSText.Body>
        )}
        <div className={styles.actions}>
          <DSSection.Actions>
            <DSButton href={artistHref} label="View Artist" />
            <DSButton href={artHref} label="View Art" variant="ghost" />
          </DSSection.Actions>
        </div>
      </div>
    </article>
  );
}

function getArtistInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'A';
}

function formatArtistTag(tag: ArtistTag): string {
  return tag
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
