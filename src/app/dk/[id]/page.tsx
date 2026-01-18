import { VersionedDeck } from '@/entities/Deck';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { DeckDB } from '@/server/db/deck.db';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Params = { id: string };

const getDeck = cache(async (id: string): Promise<VersionedDeck | null> => {
  return new DeckDB(firestoreAdmin).getLatest(id);
});

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