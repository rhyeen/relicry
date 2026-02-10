import { Art, getArtId } from '@/entities/Art';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import ArtPreviewItem from '@/components/ArtPreviewItem';
import { ArtDB } from '@/server/db/art.db';
import { cacheLife, cacheTag } from 'next/cache';
import DSButton from '@/components/ds/DSButton';
import { connection } from 'next/server';
import { Suspense } from 'react';
import DSSection from '@/components/ds/DSSection';

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
    <DSSection>
      <h1>Art</h1>
      <DSButton href="/art/new" label="New Art" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        <Suspense fallback={<div>Loading art data...</div>}>
          <ArtPageData />
        </Suspense>
      </div>
    </DSSection>
  );
}

async function ArtPageData() {
  await connection();
  const arts = await getArts();

  return arts.map((art) => (
    <ArtPreviewItem
      key={art.id}
      art={art}
      href={`/${getArtId(art.id)}`}
    />
  ));
}
