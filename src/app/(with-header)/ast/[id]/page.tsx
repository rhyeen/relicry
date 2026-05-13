import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getArtist } from '@/server/cache/artist.cache';
import { connection } from 'next/server';
import Link from 'next/link';
import StoredImageSlot from '@/components/client/StoredImage.slot';
import DSButton from '@/components/ds/DSButton';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { Artist, ArtistTag } from '@/entities/Artist';
import { ImageSize } from '@/entities/Image';
import { ArtPreviewListItem } from '@/lib/artApi';
import { buildArtQueryString, DEFAULT_ART_FILTERS } from '@/lib/artList';
import { getArtPreviewPage } from '@/server/artPreview';
import styles from './page.module.css';

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const artist = await getArtist(id);

  if (!artist) {
    return {
      title: 'Artist Not Found',
      description: 'The requested artist does not exist.',
    };
  }

  return {
    title: `${artist.name} • Relicry`,
    description: artist.summary ?? 'Details for the requested artist.',
  };
}

export default async function ArtistPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <DSPage>
      <section className={styles.root}>
        <Suspense fallback={<ArtistHeroLoading />}>
          <ArtistHeroData params={params} />
        </Suspense>
        <Suspense fallback={<ArtistGalleryLoading />}>
          <ArtistMiniGalleryData params={params} />
        </Suspense>
      </section>
    </DSPage>
  );
}

function ArtistHeroLoading() {
  return (
    <DSSection.Card background="darkBrown" padding="thick">
      <DSText.Body tone="muted">Loading artist data...</DSText.Body>
    </DSSection.Card>
  );
}

async function ArtistHeroData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const artist = await getArtist(id);
  if (!artist) notFound();

  return <ArtistHero artist={artist} />;
}

function ArtistHero({ artist }: Readonly<{ artist: Artist }>) {
  const viewAllHref = `/art${buildArtQueryString({ artistId: artist.id })}`;
  const artistTags = artist.tags ?? [];

  return (
    <section className={styles.hero}>
      {artist.bannerImageUrl ? (
        <img
          src={artist.bannerImageUrl}
          alt=""
          className={styles.bannerImage}
          aria-hidden="true"
        />
      ) : null}
      <div className={styles.heroContent}>
        <div className={styles.profileMark}>
          {artist.profileImageUrl ? (
            <img src={artist.profileImageUrl} alt="" className={styles.profileImage} aria-hidden="true" />
          ) : (
            <span>{getArtistInitials(artist.name)}</span>
          )}
        </div>

        <div className={styles.titleBlock}>
          <div className={styles.badgeRow}>
            {artistTags.length > 0 ? (
              artistTags.map((tag) => (
                <span key={tag} className={styles.badge}>{formatArtistTag(tag)}</span>
              ))
            ) : (
              <span className={styles.badge}>Artist</span>
            )}
          </div>
          <DSText.Eyebrow>Artist archive</DSText.Eyebrow>
          <DSText.Heading as="h1" size="2xl" className={styles.title}>{artist.name}</DSText.Heading>
          {artist.summary ? (
            <DSText.Body size="lg" tone="muted" className={styles.summary}>
              {artist.summary}
            </DSText.Body>
          ) : null}
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Artist ID</span>
            <span className={styles.metaValue}>{artist.id}</span>
          </div>
        </div>

        <DSSection.Actions>
          <DSButton href={viewAllHref} label="View all art" />
        </DSSection.Actions>
      </div>
    </section>
  );
}

function ArtistGalleryLoading() {
  return (
    <DSSection.Card>
      <DSText.Body tone="muted">Loading artist art...</DSText.Body>
    </DSSection.Card>
  );
}

async function ArtistMiniGalleryData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const artResponse = await getArtPreviewPage({
    ...DEFAULT_ART_FILTERS,
    artistId: getArtistIdFromRoute(id),
  });
  const previewItems = artResponse.items.slice(0, 3);

  return (
    <>
      {previewItems.length > 0 ? (
        <DSSection>
          <div className={styles.sectionHeader}>
            <DSSection.Heading>
              <DSText.Eyebrow>Mini gallery</DSText.Eyebrow>
              <DSText.Heading as="h2" size="xl">Selected art</DSText.Heading>
            </DSSection.Heading>
            <DSText.Caption>
              Showing {previewItems.length} of {artResponse.totalArts}
            </DSText.Caption>
          </div>
          <div className={styles.galleryGrid}>
            {previewItems.map((item) => (
              <ArtistArtTile key={item.art.id} item={item} />
            ))}
          </div>
        </DSSection>
      ) : (
        <DSSection.Card>
          <DSText.Body tone="muted">No art has been linked to this artist yet.</DSText.Body>
        </DSSection.Card>
      )}
    </>
  );
}

function getArtistIdFromRoute(id: string): string {
  return id.startsWith('ast/') ? id : `ast/${id}`;
}

function ArtistArtTile({ item }: Readonly<{ item: ArtPreviewListItem }>) {
  const { art } = item;
  const title = art.title?.trim() || 'Untitled';
  const description = art.description?.trim() || (art.type === 'writing' ? art.markdown : '');
  const image = art.type === 'illustration'
    ? art.image[ImageSize.CardPreview] || art.image[ImageSize.Card] || art.image[ImageSize.CardFull]
    : null;

  return (
    <Link href={item.href} className={styles.artTile} data-type={art.type}>
      {image ? (
        <StoredImageSlot
          image={image}
          size={ImageSize.CardPreview}
          alt={title}
          className={styles.artImage}
        />
      ) : (
        <span className={styles.writingExcerpt}>{description}</span>
      )}
      <span className={styles.artTileTitle}>{title}</span>
      {art.aIGenerated ? (
        <span className={styles.aiBadge} aria-label="AI generated">AI</span>
      ) : null}
    </Link>
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
