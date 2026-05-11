import EditArtSlot from '@/components/client/EditArt.slot';

export function generateMetadata() {
  return {
    title: `Add new art • Relicry`,
    description: `Add new art in Relicry.`,
  };
}

export default function NewArtAdminPage() {
  return (
    <EditArtSlot />
  );
}
