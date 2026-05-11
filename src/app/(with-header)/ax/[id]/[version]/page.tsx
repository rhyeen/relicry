import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getApex } from '@/server/cache/apex.cache';
import { connection } from 'next/server';
import DSText from '@/components/ds/DSText';

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
      <DSText.Heading as="h1">Apex Details</DSText.Heading>
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
      <DSText.Body tone="muted">ID: {apex.id}</DSText.Body>
      <DSText.Body tone="muted">Version: {apex.version}</DSText.Body>
      <DSText.Body tone="muted">Name: {apex.hidden.title}</DSText.Body>
    </div>
  );
}
