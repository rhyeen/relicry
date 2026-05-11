import type { Metadata } from 'next';
import PlaceholderLearningPage from '@/components/PlaceholderLearningPage';

export const metadata: Metadata = {
  title: 'Relicry Collection',
  description: 'Deck and collection tools for Relicry are coming soon.',
};

export default function CollectionPage() {
  return (
    <PlaceholderLearningPage
      eyebrow="Save your deck"
      title="Collection tools are coming soon."
      copy="Soon you will be able to save cards, track your collection, and prepare deck builds. Until then, keep your physical deck together and scan card QR codes whenever you need card details."
      primaryHref="/begin"
      primaryLabel="Back to Starter Guide"
      secondaryHref="/profile"
      secondaryLabel="View Your Profile"
    />
  );
}
