import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getPromotedItem } from '@/server/cache/promotedItem.cache';
import { connection } from 'next/server';
import DSText from '@/components/ds/DSText';

type Params = { id: string };

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
  return (
    <div>
      <DSText.Heading as="h1">Promoted Item Details</DSText.Heading>
      <Suspense fallback={<div>Loading promoted item data...</div>}>
        <PromotedItemPageData params={params} />
      </Suspense>
    </div>
  );
}

async function PromotedItemPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const promotedItem = await getPromotedItem(id);

  if (!promotedItem) notFound();

  return (
    <div>
      <DSText.Heading as="h2">Promoted Item</DSText.Heading>
      <DSText.Body tone="muted">ID: {promotedItem.id}</DSText.Body>
    </div>
  );
}
