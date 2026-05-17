import type { Metadata } from 'next';
import CollectionClient from './CollectionClient';

export const metadata: Metadata = {
  title: 'Relicry Collection',
  description: 'View and manage the cards saved to your Relicry collection.',
};

export default function CollectionPage() {
  return <CollectionClient />;
}
