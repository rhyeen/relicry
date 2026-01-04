import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CardCollectionActionSlot from '@/components/client/CardCollectionAction.slot';
import { getCard } from '@/server/cache/card.cache';
import { Suspense } from 'react';

type Params = { version: string; card_id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { version, card_id } = await params;
  const card = await getCard(card_id, version);

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
  return (
    <div>
      <h1>Card Details</h1>
      <Suspense fallback={<div>Loading card data...</div>}>
        <CardPageData params={params} />
      </Suspense>
    </div>
  );
}

async function CardPageData(
  { params }: { params: Promise<Params> }
) {
  const { version, card_id } = await params;
  const card = await getCard(card_id, version);
  if (!card) notFound();

  return (
    <div>
      <p>ID: {card.id}</p>
      <p>Version: {card.version}</p>
      <p>Title: {card.title}</p>
      <CardCollectionActionSlot cardId={card.id} cardVersionId={card.version} />
    </div>
  );
}
