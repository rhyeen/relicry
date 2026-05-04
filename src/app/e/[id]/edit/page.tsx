import notFound from '@/app/not-found';
import EditEventSlot from '@/components/client/EditEvent.slot';
import DSText from '@/components/ds/DSText';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { EventDB } from '@/server/db/event.db';
import { RewardDB } from '@/server/db/reward.db';
import { connection } from 'next/server';
import { Suspense } from 'react';

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const event = await new EventDB(getFirestoreAdmin()).getFromParts(id);

  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event does not exist.',
    };
  }

  return {
    title: `Edit ${event.title} • Relicry`,
    description: `Edit event ${event.title}.`,
  };
}

export default async function EditEventPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <div>
      <DSText.Heading as="h1">Edit Event</DSText.Heading>
      <Suspense fallback={<div>Loading event data...</div>}>
        <EditEventPageData params={params} />
      </Suspense>
    </div>
  );
}

async function EditEventPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const firestoreAdmin = getFirestoreAdmin();
  const event = await new EventDB(firestoreAdmin).getFromParts(id);
  if (!event) {
    notFound();
    return;
  }

  const rewards = await new RewardDB(firestoreAdmin).getBy({
    where: [{ field: 'eventId', op: '==', value: event.id }],
    sortBy: { field: 'level', direction: 'asc' },
  });

  return (
    <EditEventSlot
      event={event}
      rewardLevels={rewards.filter((reward) => reward.archivedAt === null).map((reward) => reward.level)}
    />
  );
}
