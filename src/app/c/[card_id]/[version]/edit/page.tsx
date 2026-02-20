import notFound from '@/app/not-found';
import EditCardSlot from '@/components/client/EditCard.slot';
import { getCard } from '@/server/cache/card.cache';
import { Metadata } from 'next';
import { connection } from 'next/server';
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

export default async function EditCardAdminPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <>
      <Suspense fallback={<div>Loading card data...</div>}>
        <EditCardAdminPageData params={params} />
      </Suspense>
    </>
  );
}

async function EditCardAdminPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { version, card_id } = await params;

  const card = await getCard(card_id, version);
  if (!card) notFound();

  return (
    <EditCardSlot card={card || undefined} />
  );
}