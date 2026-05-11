import type { Metadata } from 'next';
import PlaceholderLearningPage from '@/components/PlaceholderLearningPage';

export const metadata: Metadata = {
  title: 'Relicry Rulebook',
  description: 'The full Relicry rulebook is coming soon.',
};

export default function RulesPage() {
  return (
    <PlaceholderLearningPage
      eyebrow="Full rulebook"
      title="The complete rules are coming soon."
      copy="This page will collect the full rules for card timing, draw limits, scrapping, scenes, apex battles, and advanced interactions. For now, the starter guide gives you enough to begin your first quest."
      primaryHref="/begin"
      primaryLabel="Back to Starter Guide"
      secondaryHref="/cards"
      secondaryLabel="Browse Cards"
    />
  );
}
