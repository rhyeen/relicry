import { Scene } from '@/entities/Scene';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { SceneDB } from '@/server/db/scene.db';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Params = { id: string };

const getScene = cache(async (id: string): Promise<Scene | null> => {
  return new SceneDB(firestoreAdmin).getFromParts(id);
});

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