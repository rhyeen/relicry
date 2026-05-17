import EditArtistSlot from '@/components/client/EditArtist.slot';
import DSPage from '@/components/ds/DSPage';

export function generateMetadata() {
  return {
    title: `Add new artist • Relicry`,
    description: `Add new artist in Relicry.`,
  };
}

export default function NewArtistAdminPage() {
  return (
    <DSPage removeTopPadding>
      <DSPage.Back href="/artists" label="Back to artists" />
      <EditArtistSlot />
    </DSPage>
  );
}
