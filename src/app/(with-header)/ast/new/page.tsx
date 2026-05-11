import EditArtistSlot from '@/components/client/EditArtist.slot';

export function generateMetadata() {
  return {
    title: `Add new artist • Relicry`,
    description: `Add new artist in Relicry.`,
  };
}

export default function NewArtistAdminPage() {
  return (
    <EditArtistSlot />
  );
}
