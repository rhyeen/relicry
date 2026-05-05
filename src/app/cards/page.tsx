import { CardListAspectFilter, CardListTypeFilter, DEFAULT_CARDS_FILTERS } from '@/lib/cardsList';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import DSButton from '@/components/ds/DSButton';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { Aspect } from '@/entities/Aspect';
import { Suspense } from 'react';
import { connection } from 'next/server';
import CardsBrowserClient from './CardsBrowserClient';
import styles from './page.module.css';
import { getCardsPreviewPage } from '@/server/cardsPreview';
import { cacheLife, cacheTag } from 'next/cache';

async function getInitialCardsPage() {
  'use cache';

  cacheLife('expectedChangeLowConsequenceIfStale');
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag('cards:list:default');

  return getCardsPreviewPage(DEFAULT_CARDS_FILTERS);
}

export function generateMetadata() {
  return {
    title: 'Cards • Relicry',
    description: 'Cards overview.',
  };
}

export default async function CardsPage() {
  return (
    <DSSection>
      <div className={styles.page}>
        <DSText.Heading as="h1">Cards</DSText.Heading>
        <DSButton href="/cards/new" label="New Card" />
      </div>
      <Suspense fallback={<div>Loading cards...</div>}>
        <CardsPageData />
      </Suspense>
    </DSSection>
   );
}

async function CardsPageData() {
  await connection();
  const initialResponse = await getInitialCardsPage();

  return (
    <CardsBrowserClient
      initialFilters={DEFAULT_CARDS_FILTERS}
      initialResponse={initialResponse}
      typeOptions={CARD_TYPE_OPTIONS}
      aspectOptions={CARD_ASPECT_OPTIONS}
    />
  );
}

const CARD_TYPE_OPTIONS: { label: string; value: CardListTypeFilter }[] = [
  { label: 'All cards', value: 'all' },
  { label: 'Deck', value: 'deck' },
  { label: 'Focus', value: 'focus' },
  { label: 'Gambit', value: 'gambit' },
];

const CARD_ASPECT_OPTIONS: { label: string; value: CardListAspectFilter }[] = [
  { label: 'All aspects', value: 'all' },
  { label: 'Brave', value: Aspect.Brave },
  { label: 'Cunning', value: Aspect.Cunning },
  { label: 'Wise', value: Aspect.Wise },
  { label: 'Charming', value: Aspect.Charming },
  { label: 'Two aspects', value: 'dual' },
];
