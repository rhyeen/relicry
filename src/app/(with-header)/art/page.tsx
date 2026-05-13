import { Art, getArtId } from '@/entities/Art';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import ArtPreviewItem from '@/components/ArtPreviewItem';
import { ArtDB } from '@/server/db/art.db';
import { cacheLife, cacheTag } from 'next/cache';
import DSButton from '@/components/ds/DSButton';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { connection } from 'next/server';
import { Suspense } from 'react';

async function getArts(): Promise<Art[]> {
  'use cache';
  const index = 0;
  cacheLife('expectedChangeLowConsequenceIfStale');
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(`arts:list:${index}`);

  const entities = await new ArtDB(getFirestoreAdmin()).getBy({
    where: [],
    sortBy: { field: 'createdAt', direction: 'desc' },
    limit: 100,
  });
  return entities;
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
        <DSSection.Actions>
          <DSButton href="/art/new" label="New Art" variant="primary" />
        </DSSection.Actions>
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
  const arts = await getArts();

  if (arts.length === 0) {
    return (
      <DSSection.Card>
        <DSText.Body tone="muted">No art is available yet.</DSText.Body>
      </DSSection.Card>
    );
  }

  return (
    <DSSection.Grid columns={4}>
      {arts.map((art) => (
        <ArtPreviewItem
          key={art.id}
          art={art}
          href={`/${getArtId(art.id)}`}
        />
      ))}
    </DSSection.Grid>
  );
}
