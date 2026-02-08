import { Art, getArtId } from '@/entities/Art';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import ArtPreviewItem from '@/components/ArtPreviewItem';
import { ArtDB } from '@/server/db/art.db';
import { cacheLife, cacheTag, updateTag } from 'next/cache';
import DSButton from '@/components/ds/DSButton';

async function getArts(): Promise<Art[]> {
  'use cache';
  const index = 0;
  cacheLife('hours');
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(`arts:list:${index}`);

  const entities = await new ArtDB(firestoreAdmin).getBy({
    where: [],
    sortBy: { field: 'createdAt', direction: 'desc' },
    limit: 100,
  });

  // @NOTE: This is likely either due to a bug or emulated local environment is not populated yet.
  if (!entities.length) {
    updateTag(`arts:list:${index}`);
  }

  return entities;
}

export function generateMetadata() {
  return {
    title: 'Art • Relicry',
    description: 'Art overview.',
  };
}

export default async function ArtPage() {
  const arts = await getArts();

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h1>Art</h1>
        <DSButton href="/art/new" label="New Art" />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        {arts.map((art) => (
          <ArtPreviewItem
            key={art.id}
            art={art}
            href={`/${getArtId(art.id)}`}
          />
        ))}
      </div>
    </div>
  );
}
