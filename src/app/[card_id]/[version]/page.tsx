import { cache } from 'react';
import { VersionedCard } from '@/entities/Card';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CardDB } from '@/server/db/card.db';

type Params = { version: string; card_id: string };

const getCard = cache(async (version: string, id: string): Promise<VersionedCard | null> => {
  return new CardDB(firestoreAdmin).getFromParts(id, parseInt(version, 10));
});

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { version, card_id } = await params;
  const card = await getCard(version, card_id);

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
  const card = await getCard(version, card_id);

  if (!card) notFound();

  return (
    <div>
      <h1>Card Details</h1>
      <p>ID: {card.id}</p>
      <p>Version: {card.version}</p>
      <p>Title: {card.title}</p>
    </div>
  );
}
