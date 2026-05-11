import StoredImageSlot from '@/components/client/StoredImage.slot';
import DSText from '@/components/ds/DSText';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { ImageSize } from '@/entities/Image';
import { getArt } from '@/server/cache/art.cache';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const art = await getArt(id);

  if (!art) {
    return {
      title: 'Art Not Found',
      description: 'The requested art does not exist.',
    };
  }

  return {
    title: `${art.title ?? 'Untitled Art'} • Relicry`,
    description: art.description ?? 'Details for the requested art.',
  };
}

export default async function ArtPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <div>
      <DSText.Heading as="h1">Art Details</DSText.Heading>
      <Suspense fallback={<div>Loading art data...</div>}>
        <ArtPageData params={params} />
      </Suspense>
    </div>
  );
}

async function ArtPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const art = await getArt(id);
  if (!art) notFound();

  return (
    <div>
      <DSText.Heading as="h2">{art.title ?? 'Untitled Art'}</DSText.Heading>
      <DSText.Body tone="muted">ID: {art.id}</DSText.Body>
      <DSText.Body tone="muted">Type: {art.type}</DSText.Body>
      <DSText.Body tone="muted">Description: {art.description}</DSText.Body>
      {art.type === 'writing' && art.markdown && (
        <section>
          <DSText.Heading as="h3">Markdown</DSText.Heading>
          <MarkdownRenderer markdown={art.markdown} />
        </section>
      )}
      {art.type === 'illustration' && art.image[ImageSize.CardFull] &&
        <StoredImageSlot
          image={art.image[ImageSize.CardFull]}
          size={ImageSize.CardFull}
          alt={art.title}
        />
      }
    </div>
  );
}
