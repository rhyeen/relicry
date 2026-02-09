import EditCardSlot from '@/components/client/EditCard.slot';

export function generateMetadata() {
  return {
    title: `Create new deck card • Relicry`,
    description: `Create a new deck card in Relicry.`,
  };
}

export default function NewCardAdminPage() {
  return (
    <EditCardSlot type="deck" />
  );
}
