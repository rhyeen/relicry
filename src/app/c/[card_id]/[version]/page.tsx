import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cardCache } from '@/server/cache/card.cache';
import dynamicImport from 'next/dynamic';

// NextJS-read exports
export const dynamic = 'force-static';
// @NOTE: Number needs to be a literal for NextJS to pick it up correctly
export const revalidate = 21600; // 6 hours

type Params = { version: string; card_id: string };

const CardCollectionAction = dynamicImport(
  () => import('@/components/client/CardCollectionAction'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { version, card_id } = await params;
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
  const { version, card_id } = await params;
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
