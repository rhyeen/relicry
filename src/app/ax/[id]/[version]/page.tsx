import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getApex } from '@/server/cache/apex.cache';
import { connection } from 'next/server';

type Params = { version: string; id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { version, id } = await params;
  const apex = await getApex(id, version);
  
  if (!apex) {
    return {
      title: 'Apex Not Found',
      description: 'The requested apex does not exist.',
    };
  }

  return {
    title: `${apex.revealed.title} • Relicry`,
    description: `Details for apex ${apex.revealed.title} (version ${apex.version})`,
  };
}

export default async function ApexPage({ params }: { params: Promise<Params> }) {
  return (
    <div>
      <h1>Apex Details</h1>
      <Suspense fallback={<div>Loading apex data...</div>}>
        <ApexPageData params={params} />
      </Suspense>
    </div>
  );
}

async function ApexPageData({ params }: { params: Promise<Params> }) {
  await connection();
  const { version, id } = await params;
  const apex = await getApex(id, version);

  if (!apex) {
    notFound();
  }

  return (
    <div>
      <p>ID: {apex.id}</p>
      <p>Version: {apex.version}</p>
      <p>Name: {apex.hidden.title}</p>
    </div>
  );
}
