import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import DeckDetailClient from './DeckDetailClient';

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Deck ${id} • Relicry`,
    description: 'Manage a Relicry deck.',
  };
}

export default function DeckPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={null}>
      <DeckPageData params={params} />
    </Suspense>
  );
}

async function DeckPageData({ params }: { params: Promise<Params> }) {
  await connection();
  const { id } = await params;
  return <DeckDetailClient deckId={id} />;
}
