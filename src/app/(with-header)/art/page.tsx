import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag } from 'next/cache';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { connection } from 'next/server';
import { Suspense } from 'react';
import ArtBrowserClient from './ArtBrowserClient';
import {
  areArtFiltersEqual,
  ArtListGenerationFilter,
  ArtListTypeFilter,
  DEFAULT_ART_FILTERS,
  parseArtFilters,
} from '@/lib/artList';
import { getArtPreviewPage } from '@/server/artPreview';

type SearchParams = Record<string, string | string[] | undefined>;

async function getInitialArtPage() {
  'use cache';

  cacheLife('expectedChangeLowConsequenceIfStale');
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag('arts:list:default');

  return getArtPreviewPage(DEFAULT_ART_FILTERS);
}

export function generateMetadata() {
  return {
    title: 'Art • Relicry',
    description: 'Art overview.',
  };
}

export default async function ArtPage(
  { searchParams }: { searchParams?: Promise<SearchParams> }
) {
  return (
    <DSPage>
      <Suspense fallback={<ArtLoading />}>
        <ArtPageData searchParams={searchParams} />
      </Suspense>
    </DSPage>
  );
}

function ArtLoading() {
  return (
    <DSSection.Card>
      <DSText.Body tone="muted">Loading art data...</DSText.Body>
    </DSSection.Card>
  );
}

async function ArtPageData(
  { searchParams }: { searchParams?: Promise<SearchParams> }
) {
  await connection();
  const filters = parseArtFilters(await searchParams);
  const initialResponse = areArtFiltersEqual(filters, DEFAULT_ART_FILTERS)
    ? await getInitialArtPage()
    : await getArtPreviewPage(filters);

  if (initialResponse.totalArts === 0) {
    return (
      <DSSection.Card>
        <DSText.Body tone="muted">No art is available yet.</DSText.Body>
      </DSSection.Card>
    );
  }

  return (
    <ArtBrowserClient
      initialFilters={filters}
      initialResponse={initialResponse}
      typeOptions={ART_TYPE_OPTIONS}
      generationOptions={ART_GENERATION_OPTIONS}
    />
  );
}

const ART_TYPE_OPTIONS: { label: string; value: ArtListTypeFilter }[] = [
  { label: 'All art', value: 'all' },
  { label: 'Illustration', value: 'illustration' },
  { label: 'Writing', value: 'writing' },
];

const ART_GENERATION_OPTIONS: { label: string; value: ArtListGenerationFilter }[] = [
  { label: 'Any generation', value: 'all' },
  { label: 'AI generated', value: 'ai' },
  { label: 'Original', value: 'original' },
];
