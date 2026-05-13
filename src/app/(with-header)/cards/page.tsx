import { CardListAspectFilter, CardListTypeFilter, DEFAULT_CARDS_FILTERS } from '@/lib/cardsList';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { Aspect } from '@/entities/Aspect';
import { Suspense } from 'react';
import CardsBrowserClient from './CardsBrowserClient';
import { getCardsPreviewPage } from '@/server/cardsPreview';
import { cacheLife, cacheTag } from 'next/cache';
import { connection } from 'next/server';
import CardsPageActions from './CardsPageActions';

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
    <DSPage>
      <DSSection.Card background="darkBrown" padding="thick">
        <DSSection.Heading>
          <DSText.Eyebrow>Collection archive</DSText.Eyebrow>
          <DSText.Heading as="h1" size="2xl">Cards</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body size="lg" tone="muted">
            Browse the public Relicry card archive, filter by card role or aspect, and open a
            card to see its full art, rules, and story details.
          </DSText.Body>
        </DSSection.Text>
        <CardsPageActions />
      </DSSection.Card>
      <Suspense fallback={<CardsLoading />}>
        <CardsPageData />
      </Suspense>
    </DSPage>
  );
}

function CardsLoading() {
  return (
    <DSSection.Card>
      <DSText.Body tone="muted">Loading cards...</DSText.Body>
    </DSSection.Card>
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
