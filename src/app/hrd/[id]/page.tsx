import { Herald } from '@/entities/Herald';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { HeraldDB } from '@/server/db/herald.db';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Params = { id: string };

const getHerald = cache(async (id: string): Promise<Herald | null> => {
  return new HeraldDB(firestoreAdmin).getFromParts(id);
});

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