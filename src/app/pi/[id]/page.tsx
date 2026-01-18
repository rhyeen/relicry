import { PromotedItem } from '@/entities/PromotedItem';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { PromotedItemDB } from '@/server/db/promotedItem.db';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Params = { id: string };

const getPromotedItem = cache(async (id: string): Promise<PromotedItem | null> => {
  return new PromotedItemDB(firestoreAdmin).getFromParts(id);
});

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const promotedItem = await getPromotedItem(id);

  if (!promotedItem) {
    return {
      title: 'Promoted Item Not Found',
      description: 'The requested promoted item does not exist.',
    };
  }

  return {
    title: `${promotedItem.id} • Relicry`,
    description: promotedItem.id,
  };
}

export default async function PromotedItemPage(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const promotedItem = await getPromotedItem(id);

  if (!promotedItem) notFound();

  return (
    <div>
      <h1>Promoted Item</h1>
      <p>ID: {promotedItem.id}</p>
    </div>
  );
}