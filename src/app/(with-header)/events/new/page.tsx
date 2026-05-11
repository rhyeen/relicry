import EditEventSlot from '@/components/client/EditEvent.slot';
import { getFeaturedStarterFocusOptions } from '@/server/starterDecks';
import { connection } from 'next/server';
import { Suspense } from 'react';

export function generateMetadata() {
  return {
    title: 'New Event • Relicry',
    description: 'Create a new event.',
  };
}

export default function NewEventPage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <NewEventPageData />
    </Suspense>
  );
}

async function NewEventPageData() {
  await connection();
  const starterFocusOptions = await getFeaturedStarterFocusOptions();
  return <EditEventSlot starterFocusOptions={starterFocusOptions} />;
}
