import type { Metadata } from 'next';
import PlaceholderLearningPage from '@/components/PlaceholderLearningPage';

export const metadata: Metadata = {
  title: 'Relicry Lore',
  description: 'Relicry lore and stories are coming soon.',
};

export default function LorePage() {
  return (
    <PlaceholderLearningPage
      eyebrow="Lore and stories"
      title="The world of Relicry is opening soon."
      copy="Card pages, artist pages, and event stories will build out the lore of Relicry over time. This page will become a home for those stories as more of the world is revealed."
      primaryHref="/begin"
      primaryLabel="Back to Starter Guide"
      secondaryHref="/art"
      secondaryLabel="Explore Art"
    />
  );
}
