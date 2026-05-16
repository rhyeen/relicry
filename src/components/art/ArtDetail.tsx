import Link from 'next/link';
import StoredImageSlot from '@/components/client/StoredImage.slot';
import DSButton from '@/components/ds/DSButton';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Art, IllustrationArt, WritingArt } from '@/entities/Art';
import { Artist } from '@/entities/Artist';
import { ImageSize } from '@/entities/Image';
import styles from './ArtDetail.module.css';

type Props = Readonly<{
  art: Art;
  artist: Artist | null;
  mode?: 'page' | 'dialog';
}>;

export default function ArtDetail({ art, artist, mode = 'page' }: Props) {
  if (art.type === 'illustration') {
    return <IllustrationArtDetail art={art} artist={artist} mode={mode} />;
  }

  return <WritingArtDetail art={art} artist={artist} mode={mode} />;
}

export function IllustrationArtDetail({
  art,
  artist,
  mode = 'page',
}: Readonly<{
  art: IllustrationArt;
  artist: Artist | null;
  mode?: 'page' | 'dialog';
}>) {
  const image = getIllustrationImage(art);

  return (
    <section className={styles.root} data-art-type="illustration" data-mode={mode}>
      <article className={`${styles.hero} ${styles.illustrationHero}`}>
        <div className={styles.imageStage}>
          {image ? (
            <StoredImageSlot
              image={image.image}
              size={image.size}
              alt={art.title ?? 'Untitled art'}
              className={styles.image}
              eager={mode === 'dialog'}
            />
          ) : (
            <div className={styles.emptyImage}>No illustration image available</div>
          )}
        </div>
        <ArtHeroPanel art={art} artist={artist} />
      </article>
    </section>
  );
}

export function WritingArtDetail({
  art,
  artist,
  mode = 'page',
}: Readonly<{
  art: WritingArt;
  artist: Artist | null;
  mode?: 'page' | 'dialog';
}>) {
  return (
    <section className={styles.root} data-art-type="writing" data-mode={mode}>
      <article className={`${styles.hero} ${styles.writingHero}`}>
        <ArtHeroPanel art={art} artist={artist} />
      </article>
      <section className={styles.writingShell}>
        <DSSection.Heading>
          <DSText.Eyebrow>Writing</DSText.Eyebrow>
          <DSText.Heading as="h2" size="xl">Read the piece</DSText.Heading>
        </DSSection.Heading>
        <div className={styles.writingPaper}>
          <div className={styles.writingContent}>
            <MarkdownRenderer markdown={art.markdown} />
          </div>
        </div>
      </section>
    </section>
  );
}

export function ArtHeroPanel({
  art,
  artist,
}: Readonly<{
  art: Art;
  artist: Artist | null;
}>) {
  const title = art.title?.trim() || 'Untitled Art';
  const artistLabel = artist?.name?.trim() || art.artistId || 'Unknown artist';
  const typeLabel = art.type === 'illustration' ? 'Illustration' : 'Writing';

  return (
    <div className={styles.heroPanel}>
      <div className={styles.titleBlock}>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>{typeLabel}</span>
          {art.aIGenerated ? <span className={styles.badge}>AI</span> : null}
        </div>
        <DSText.Eyebrow>{art.type === 'illustration' ? 'Art archive' : 'Story archive'}</DSText.Eyebrow>
        <DSText.Heading as="h1" size="2xl" className={styles.title}>{title}</DSText.Heading>
        {art.description ? (
          <DSText.Body size="lg" tone="muted" className={styles.description}>
            {art.description}
          </DSText.Body>
        ) : null}
      </div>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Artist</span>
          <Link href={`/${art.artistId}`} className={styles.artistLink}>
            {artistLabel}
          </Link>
          {artist?.summary ? (
            <span className={styles.artistSummary}>{artist.summary}</span>
          ) : null}
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Archive ID</span>
          <span className={styles.metaValue}>{art.id}</span>
        </div>
      </div>

      <DSSection.Actions>
        {art.referenceUrl ? (
          <DSButton
            href={art.referenceUrl}
            label="Reference source"
            rel="noreferrer noopener"
            target="_blank"
          />
        ) : null}
      </DSSection.Actions>
    </div>
  );
}

export function getIllustrationImage(art: IllustrationArt) {
  if (art.image[ImageSize.CardFull]) {
    return { image: art.image[ImageSize.CardFull], size: ImageSize.CardFull };
  }
  if (art.image[ImageSize.Card]) {
    return { image: art.image[ImageSize.Card], size: ImageSize.Card };
  }
  if (art.image[ImageSize.CardPreview]) {
    return { image: art.image[ImageSize.CardPreview], size: ImageSize.CardPreview };
  }

  return null;
}
