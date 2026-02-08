import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getDeck } from '@/server/cache/deck.cache';
import { connection } from 'next/server';

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const deck = await getDeck(id);

  if (!deck) {
    return {
      title: 'Deck Not Found',
      description: 'The requested deck does not exist.',
    };
  }

  return {
    title: `${deck.name} • Relicry`,
    description: `Details for the deck ${deck.name}.`,
  };
}

export default async function DeckPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <div>
      <h1>Deck Details</h1>
      <Suspense fallback={<div>Loading deck data...</div>}>
        <DeckPageData params={params} />
      </Suspense>
    </div>
  );
}

async function DeckPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const deck = await getDeck(id);

  if (!deck) notFound();

  return (
    <div>
      <h1>{deck.name}</h1>
      <p>ID: {deck.id}</p>
      <p>Description: {deck.userId}</p>
      <p>Version: {deck.version}</p>
    </div>
  );
}
