import type { Metadata } from 'next';
import { Suspense } from 'react';
import StarterDeckScanClient from './StarterDeckScanClient';

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Starter Deck Scan • ${id} • Relicry`,
    description: 'Scan a Relicry player QR code to record a starter deck claim for this event.',
  };
}

export default async function StarterDeckScanPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={null}>
      <StarterDeckScanPageData params={params} />
    </Suspense>
  );
}

async function StarterDeckScanPageData({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return <StarterDeckScanClient eventId={id} />;
}
