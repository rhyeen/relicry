import { StoredApex } from '@/entities/Apex';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { ApexDB } from '@/server/db/apex.db';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Params = { version: string; id: string };

const getApex = cache(async (version: string, id: string): Promise<StoredApex | null> => {
  return new ApexDB(firestoreAdmin).getFromParts(id, parseInt(version, 10));
});

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { version, id } = await params;
  const apex = await getApex(version, id);
  
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
  const { version, id } = await params;
  const apex = await getApex(version, id);
  
  if (!apex) {
    notFound();
  }
  
  return (
    <div>
      <h1>Apex Details</h1>
      <p>ID: {apex.id}</p>
      <p>Version: {apex.version}</p>
      <p>Name: {apex.hidden.title}</p>
    </div>
  );
}