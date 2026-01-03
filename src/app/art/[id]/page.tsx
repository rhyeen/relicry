import { StoredImage } from '@/components/client/StoredImage';
import { ImageSize } from '@/entities/Image';
import { artCache } from '@/server/cache/art.cache';
import { notFound } from 'next/navigation';

// NextJS-read exports
export const dynamic = 'force-static';
// @NOTE: Number needs to be a literal for NextJS to pick it up correctly
export const revalidate = 3600; // 1 hours

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const art = await artCache.get(id);

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
  const { id } = await params;
  const art = await artCache.get(id);

  if (!art) notFound();

  return (
    <div>
      <h1>{art.title ?? 'Untitled Art'}</h1>
      <p>ID: {art.id}</p>
      <p>Type: {art.type}</p>
      <p>Description: {art.description}</p>
      {art.type === 'illustration' && art.image[ImageSize.CardFull] &&
        <StoredImage
          image={art.image[ImageSize.CardFull]}
          size={ImageSize.CardFull}
          alt={art.title}
        />
      }
    </div>
  );
}