import EditCardSlot from '@/components/client/EditCard.slot';

export function generateMetadata() {
  return {
    title: `Create new card • Relicry`,
    description: `Create a new card in Relicry.`,
  };
}

export default function NewCardAdminPage() {
  return (
    <EditCardSlot />
  );
}
