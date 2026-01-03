import StoredImageSlot from '@/components/client/StoredImage.slot';
import { ImageSize } from '@/entities/Image';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { getArt } from '@/server/cache/art.cache';
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  'use cache';
  const { id } = await params;

  cacheLife('unlikelyChange');
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(`m/art/${id}`);

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
  'use cache';
  const { id } = await params;

  cacheLife('unlikelyChange');
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(`p/art/${id}`);

  const art = await getArt(id);

  if (!art) notFound();

  return (
    <div>
      <h1>{art.title ?? 'Untitled Art'}</h1>
      <p>ID: {art.id}</p>
      <p>Type: {art.type}</p>
      <p>Description: {art.description}</p>
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