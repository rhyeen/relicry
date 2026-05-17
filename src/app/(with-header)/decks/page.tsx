import type { Metadata } from 'next';
import DecksClient from './DecksClient';

export const metadata: Metadata = {
  title: 'Relicry Decks',
  description: 'View and manage your Relicry decks.',
};

export default function DecksPage() {
  return <DecksClient />;
}
