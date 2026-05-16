import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DownloadUnpublishedAdvance from '@/components/client/DownloadUnpublishedAdvance';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { getCard } from '@/server/cache/card.cache';
import { Suspense } from 'react';
import { getArt } from '@/server/cache/art.cache';
import { getArtist } from '@/server/cache/artist.cache';
import { VersionedFocusCard } from '@/entities/Card';
import { normalizeAwakenedSP, normalizeSizeSP } from '@/lib/normalizeSearchParams';
import {
  normalizeDownloadUnpublishedSP,
  normalizeUnpublishedCursorSP,
} from '@/lib/unpublishedDownload';
import { connection } from 'next/server';
import CardDetailClient from './CardDetailClient';

type Params = { version: string; card_id: string };
type SearchParams = {
  size?: string | string[];
  awakened?: string | string[];
  downloadUnpublished?: string | string[];
  unpublishedCursor?: string | string[];
};

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
    <DSPage removeTopPadding>
      <Suspense fallback={<CardLoading />}>
        <CardPageData params={params} searchParams={searchParams} />
      </Suspense>
    </DSPage>
  );
}

function CardLoading() {
  return (
    <DSSection.Card>
      <DSText.Body tone="muted">Loading card data...</DSText.Body>
    </DSSection.Card>
  );
}

async function CardPageData(
  { params, searchParams }: { params: Promise<Params>; searchParams?: Promise<SearchParams> }
) {
  await connection();
  const [{ version, card_id }, sp] = await Promise.all([params, searchParams]);
  const size = normalizeSizeSP(sp);
  const awakened = normalizeAwakenedSP(sp);
  const downloadUnpublished = normalizeDownloadUnpublishedSP(sp);
  const unpublishedCursor = normalizeUnpublishedCursorSP(sp);

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
    <>
      <DownloadUnpublishedAdvance
        enabled={downloadUnpublished}
        awakened={awakened}
        isFocus={card.type === 'focus'}
        cursor={unpublishedCursor}
      />
      <CardDetailClient
        card={card}
        art={illustrationArt}
        artist={illustrationArtist}
        size={size}
        awakenedArt={awakenedIllustrationArt}
        awakenedArtist={awakenedIllustrationArtist}
        flavorTextExtendedArt={flavorTextExtendedArt}
        flavorTextExtendedArtist={flavorTextExtendedArtist}
        awakenedFlavorTextExtendedArt={awakenedFlavorTextExtendedArt}
        awakenedFlavorTextExtendedArtist={awakenedFlavorTextExtendedArtist}
        awakened={card.type === 'focus' && awakened}
      />
    </>
  );
}
