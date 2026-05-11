import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getScene } from '@/server/cache/scene.cache';
import { connection } from 'next/server';
import DSText from '@/components/ds/DSText';

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
      <DSText.Heading as="h1">Scene Details</DSText.Heading>
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
      <DSText.Heading as="h2">{scene.title}</DSText.Heading>
      <DSText.Body tone="muted">ID: {scene.id}</DSText.Body>
      <DSText.Body tone="muted">Description: {scene.description}</DSText.Body>
    </div>
  );
}
