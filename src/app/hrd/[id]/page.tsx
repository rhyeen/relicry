import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getHerald } from '@/server/cache/herald.cache';
import { connection } from 'next/server';

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const herald = await getHerald(id);

  if (!herald) {
    return {
      title: 'Herald Not Found',
      description: 'The requested herald does not exist.',
    };
  }

  return {
    title: `${herald.userId} • Relicry`,
    description: `Details for the herald ${herald.userId}.`,
  };
}

export default async function HeraldPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <div>
      <h1>Herald Details</h1>
      <Suspense fallback={<div>Loading herald data...</div>}>
        <HeraldPageData params={params} />
      </Suspense>
    </div>
  );
}

async function HeraldPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const herald = await getHerald(id);

  if (!herald) notFound();

  return (
    <div>
      <h1>{herald.userId}</h1>
      <p>ID: {herald.id}</p>
    </div>
  );
}
