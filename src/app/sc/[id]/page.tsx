import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getScene } from '@/server/cache/scene.cache';
import { connection } from 'next/server';

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const scene = await getScene(id);

  if (!scene) {
    return {
      title: 'Scene Not Found',
      description: 'The requested scene does not exist.',
    };
  }

  return {
    title: `${scene.title} • Relicry`,
    description: scene.description,
  };
}

export default async function ScenePage(
  { params }: { params: Promise<Params> }
) {
  return (
    <div>
      <h1>Scene Details</h1>
      <Suspense fallback={<div>Loading scene data...</div>}>
        <ScenePageData params={params} />
      </Suspense>
    </div>
  );
}

async function ScenePageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const scene = await getScene(id);

  if (!scene) notFound();

  return (
    <div>
      <h1>{scene.title}</h1>
      <p>ID: {scene.id}</p>
      <p>Description: {scene.description}</p>
    </div>
  );
}
