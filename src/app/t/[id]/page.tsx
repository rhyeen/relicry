import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { getAnyOfToken } from '@/server/cache/questToken.cache';
import FullQuestTokenCard from '@/components/quest/FullQuestTokenCard';
import { CardType } from '@/entities/CardContext';
import { normalizeSizeSP } from '@/lib/normalizeSearchParams';

type Params = { id: string };
type SearchParams = { size?: string | string[] };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const token = await getAnyOfToken(id);

  if (!token) {
    return {
      title: 'Quest Token Not Found',
      description: 'The requested quest token does not exist.',
    };
  }

  return {
    title: `${token.id} • Relicry`,
    description: token.faction ? `Faction: ${token.faction}` : 'No faction specified',
  };
}

export default async function QuestTokenPage(
  { params, searchParams }: { params: Promise<Params>; searchParams?: Promise<SearchParams> }
) {
  return (
    <div>
      <h1>Quest Token Details</h1>
      <Suspense fallback={<div>Loading quest token data...</div>}>
        <QuestTokenPageData params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function QuestTokenPageData(
  { params, searchParams }: { params: Promise<Params>; searchParams?: Promise<SearchParams> }
) {
  await connection();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const size = normalizeSizeSP(sp);

  const token = await getAnyOfToken(id);
  if (!token) notFound();

  return (
    <section>
      <FullQuestTokenCard token={token} side="front" ctx={{
        type: CardType.Full,
        size,
      }} />
    </section>
  );
}
