import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { getAnyOfToken } from '@/server/cache/questToken.cache';
import FullQuestTokenCard from '@/components/quest/FullQuestTokenCard';
import { CardSize, CardType } from '@/entities/CardContext';
import { normalizeSideSP, normalizeSizeSP } from '@/lib/normalizeSearchParams';
import DSText from '@/components/ds/DSText';
import cardStyles from '@/components/card/Card.module.css';

type Params = { id: string };
type SearchParams = { size?: string | string[]; side?: string | string[] };

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
    <Suspense fallback={null}>
      <QuestTokenPageData params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function QuestTokenPageData(
  { params, searchParams }: { params: Promise<Params>; searchParams?: Promise<SearchParams> }
) {
  await connection();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const size = normalizeSizeSP(sp);
  const side = normalizeSideSP(sp);
  const isPrintSize = size === CardSize.PrintSize;

  const token = await getAnyOfToken(id);
  if (!token) notFound();

  return (
    <div>
      {!isPrintSize && <DSText.Heading as="h1">Quest Token Details</DSText.Heading>}
      <div
        className={[
          cardStyles.cardContainer,
          isPrintSize ? cardStyles.printSize : '',
          isPrintSize ? cardStyles.printSizeEdgeToEdge : '',
        ].filter(Boolean).join(' ')}
      >
        <FullQuestTokenCard token={token} side={side} ctx={{
          type: CardType.Full,
          size,
        }} />
      </div>
    </div>
  );
}
