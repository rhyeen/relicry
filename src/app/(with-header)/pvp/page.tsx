import type { Metadata } from 'next';
import PlaceholderLearningPage from '@/components/PlaceholderLearningPage';

export const metadata: Metadata = {
  title: 'Relicry PvP Battles',
  description: 'Player versus player rules for Relicry are coming soon.',
};

export default function PvpPage() {
  return (
    <PlaceholderLearningPage
      eyebrow="PvP battles"
      title="Friendly player battles are coming soon."
      copy="Relicry is built first around quests and cooperative apex battles, but decks can also be used for casual battles with friends. This page will explain the PvP format once those rules are ready."
      primaryHref="/begin"
      primaryLabel="Back to Starter Guide"
      secondaryHref="/cards"
      secondaryLabel="Browse Cards"
    />
  );
}
