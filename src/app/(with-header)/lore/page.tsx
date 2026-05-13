import type { Metadata } from 'next';
import PlaceholderLearningPage from '@/components/PlaceholderLearningPage';

export const metadata: Metadata = {
  title: 'Relicry Lore',
  description: 'Relicry lore and stories are coming soon.',
};

export default function LorePage() {
  return (
    <PlaceholderLearningPage
      eyebrow="The world of Relicry"
      title="There are more stories to tell..."
      copy="The Relicry cards only tell part of the story of the Relicry and its magic. There are more stones left unturned and secrets to uncover. But for now, those mysteries remain hidden; we’re working on drafting the lore and sharing it with you soon."
      primaryHref="/about"
      primaryLabel="Learn More about the Game"
      secondaryHref="/art"
      secondaryLabel="Explore the Art"
    />
  );
}
