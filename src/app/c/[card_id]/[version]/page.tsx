import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cardCache } from '@/server/cache/card.cache';
import dynamic from 'next/dynamic';
import { cacheLife, cacheTag } from 'next/cache';
import { LOCAL_CACHE_TAG } from '@/lib/local';

type Params = { version: string; card_id: string };

const CardCollectionAction = dynamic(
  () => import('@/components/client/CardCollectionAction'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  'use cache';
  const { version, card_id } = await params;

  cacheLife(cardCache.cacheLifeValue() as Parameters<typeof cacheLife>[0]);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(cardCache.getMetadataTag(card_id, version));

  const card = await cardCache.get(card_id, version);

  if (!card) {
    return {
      title: 'Card Not Found',
      description: 'The requested card does not exist.',
    };
  }

  return {
    title: `${card.title} • Relicry`,
    description: `Details for card ${card.title} (version ${card.version})`,
  };
}

export default async function CardPage(
  { params }: { params: Promise<Params> }
) {
  'use cache';
  const { version, card_id } = await params;

  cacheLife(cardCache.cacheLifeValue() as Parameters<typeof cacheLife>[0]);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(cardCache.getPageTag(card_id, version));

  const card = await cardCache.get(card_id, version);

  if (!card) notFound();

  return (
    <div>
      <h1>Card Details</h1>
      <p>ID: {card.id}</p>
      <p>Version: {card.version}</p>
      <p>Title: {card.title}</p>
      <CardCollectionAction cardId={card.id} />
    </div>
  );
}
