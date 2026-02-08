import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

type Params = { card_id: string };

export default async function CardPage(
  { params }: { params: Promise<Params>; }
) {
  return (
    <Suspense fallback={null}>
      <CardPageData params={params} />
    </Suspense>
  );
}

async function CardPageData(
  { params }: { params: Promise<Params>; }
) {
  await connection();
  const { card_id } = await params;
  return redirect(`/c/${card_id}/1`);
}
