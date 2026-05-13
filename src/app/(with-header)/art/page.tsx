import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag } from 'next/cache';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { connection } from 'next/server';
import { Suspense } from 'react';
import AdminPageAction from '@/components/client/AdminPageAction';
import { AdminRole } from '@/entities/AdminRole';
import ArtBrowserClient from './ArtBrowserClient';
import { ArtListGenerationFilter, ArtListTypeFilter, DEFAULT_ART_FILTERS } from '@/lib/artList';
import { getArtPreviewPage } from '@/server/artPreview';

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

export default async function ArtPage() {
  return (
    <DSPage>
      <DSSection.Card background="darkBrown" padding="thick">
        <DSSection.Heading>
          <DSText.Eyebrow>Gallery</DSText.Eyebrow>
          <DSText.Heading as="h1" size="2xl">Art</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body size="lg" tone="muted">
            Explore Relicry illustrations and writing, from card art to story pieces that shape the
            world behind each adventure.
          </DSText.Body>
        </DSSection.Text>
        <AdminPageAction href="/art/new" label="New Art" requiredRole={AdminRole.SuperAdmin} />
      </DSSection.Card>

      <Suspense fallback={<ArtLoading />}>
        <ArtPageData />
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

async function ArtPageData() {
  await connection();
  const initialResponse = await getInitialArtPage();

  if (initialResponse.totalArts === 0) {
    return (
      <DSSection.Card>
        <DSText.Body tone="muted">No art is available yet.</DSText.Body>
      </DSSection.Card>
    );
  }

  return (
    <ArtBrowserClient
      initialFilters={DEFAULT_ART_FILTERS}
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
