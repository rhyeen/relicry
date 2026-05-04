import EditEventSlot from '@/components/client/EditEvent.slot';

export function generateMetadata() {
  return {
    title: 'New Event • Relicry',
    description: 'Create a new event.',
  };
}

export default function NewEventPage() {
  return <EditEventSlot />;
}
