import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CardCollectionActionSlot from '@/components/client/CardCollectionAction.slot';
import { getCard } from '@/server/cache/card.cache';
import { Suspense } from 'react';
import { getArt } from '@/server/cache/art.cache';
import { getArtist } from '@/server/cache/artist.cache';
import { VersionedFocusCard } from '@/entities/Card';
import Card from '@/components/card/Card';
import { normalizeSizeSP } from '@/lib/normalizeSearchParams';
import { CardType } from '@/entities/CardContext';

type Params = { version: string; card_id: string };
type SearchParams = { size?: string | string[] };

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

export default async function CardPage(
  { params, searchParams }: { params: Promise<Params>; searchParams?: Promise<SearchParams> }
) {
  return (
    <>
      <h1>Card Details</h1>
      <Suspense fallback={<div>Loading card data...</div>}>
        <CardPageData params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function CardPageData(
  { params, searchParams }: { params: Promise<Params>; searchParams?: Promise<SearchParams> }
) {
  const [{ version, card_id }, sp] = await Promise.all([params, searchParams]);
  const size = normalizeSizeSP(sp);

  const card = await getCard(card_id, version);
  if (!card) notFound();

  const awakenedVersion: VersionedFocusCard | null = card.awakenedVersion
    ? (card.awakenedVersion as VersionedFocusCard)
    : null;

  const [
    illustrationArt,
    illustrationArtist,
    flavorTextExtendedArt,
    flavorTextExtendedArtist,
    awakenedIllustrationArt,
    awakenedIllustrationArtist,
    awakenedFlavorTextExtendedArt,
    awakenedFlavorTextExtendedArtist,
  ] = await Promise.all([
    getArt(card.illustration.artId),
    getArtist(card.illustration.artistId),
    card.flavorText?.extended ? getArt(card.flavorText.extended.artId) : null,
    card.flavorText?.extended ? getArtist(card.flavorText.extended.artistId) : null,
    awakenedVersion?.illustration ? getArt(awakenedVersion.illustration.artId) : null,
    awakenedVersion?.illustration ? getArtist(awakenedVersion.illustration.artistId) : null,
    awakenedVersion?.flavorText?.extended ? getArt(awakenedVersion.flavorText.extended.artId) : null,
    awakenedVersion?.flavorText?.extended ? getArtist(awakenedVersion.flavorText.extended.artistId) : null,
  ]);

  return (
    <section>
      <Card
        card={card}
        art={illustrationArt}
        artist={illustrationArtist}
        ctx={{
          type: CardType.Full,
          size: size,
        }}
      />
      <CardCollectionActionSlot cardId={card.id} cardVersionId={card.version} />
    </section>
  );
}
