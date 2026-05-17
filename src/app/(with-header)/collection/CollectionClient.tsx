'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CardPreviewItem from '@/components/CardPreviewItem';
import CardCollectionAction from '@/components/client/CardCollectionAction';
import LoginDialog from '@/components/client/LoginDialog';
import DSButton from '@/components/ds/DSButton';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';
import DSPage from '@/components/ds/DSPage';
import DSPagination from '@/components/ds/DSPagination';
import DSSection from '@/components/ds/DSSection';
import DSSegmentedControl from '@/components/ds/DSSegmentedControl';
import DSSpinner from '@/components/ds/DSSpinner';
import DSText from '@/components/ds/DSText';
import { CollectionIcon } from '@/components/ds/DSNavIcons';
import { Aspect } from '@/entities/Aspect';
import { PlayerCardDTO, PlayerCardOwnership } from '@/entities/PlayerCard';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useUser } from '@/lib/client/useUser';
import {
  areCollectionFiltersEqual,
  buildCollectionQueryString,
  CollectionCardFilters,
  CollectionCardScope,
  CardListAspectFilter,
  CardListTypeFilter,
  DEFAULT_COLLECTION_FILTERS,
  parseCollectionFilters,
} from '@/lib/cardsList';
import type { PlayerCardCollectionItem, PlayerCardListResponse } from '@/lib/playerCardsApi';
import CardsToolbar from '../cards/CardsToolbar';
import styles from './CollectionClient.module.css';

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

const SCOPE_OPTIONS: { label: string; value: CollectionCardScope }[] = [
  { label: 'My collection', value: 'collection' },
  { label: 'All cards', value: 'all' },
];

export default function CollectionClient() {
  const auth = useAuthUser();
  const profile = useUser();
  const [draftQuery, setDraftQuery] = useState(DEFAULT_COLLECTION_FILTERS.query);
  const [draftType, setDraftType] = useState<CardListTypeFilter>(DEFAULT_COLLECTION_FILTERS.type);
  const [draftAspect, setDraftAspect] = useState<CardListAspectFilter>(DEFAULT_COLLECTION_FILTERS.aspect);
  const [activeFilters, setActiveFilters] = useState<CollectionCardFilters>(DEFAULT_COLLECTION_FILTERS);
  const [response, setResponse] = useState<PlayerCardListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setDraftQuery(activeFilters.query);
    setDraftType(activeFilters.type);
    setDraftAspect(activeFilters.aspect);
  }, [activeFilters]);

  const loadCollection = useCallback(async (filters: CollectionCardFilters) => {
    if (!auth.user || !profile.user) return;

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const queryString = buildCollectionQueryString(filters);
      const res = await fetch(`/api/player-card${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`GET failed: ${res.status}`);
      const json = await res.json() as PlayerCardListResponse;

      if (requestIdRef.current === currentRequestId) {
        setResponse(json);
      }
    } catch (e) {
      console.error(e);
      if (requestIdRef.current === currentRequestId) {
        setError('Unable to load your collection. Refresh the page, or log out and back in if this keeps happening.');
      }
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, [auth.user, profile.user]);

  useEffect(() => {
    if (auth.ready && profile.ready && auth.user && profile.user) {
      loadCollection(activeFilters);
    }
  }, [activeFilters, auth.ready, auth.user, loadCollection, profile.ready, profile.user]);

  const handleLocationFilters = useCallback((nextFilters: CollectionCardFilters) => {
    setActiveFilters((current) => (
      areCollectionFiltersEqual(nextFilters, current) ? current : nextFilters
    ));
  }, []);

  const updateUrl = (nextFilters: CollectionCardFilters) => {
    const queryString = buildCollectionQueryString(nextFilters);
    const nextUrl = queryString ? `/collection${queryString}` : '/collection';
    window.history.pushState(null, '', nextUrl);
    setActiveFilters(nextFilters);
  };

  const applyFilters = () => {
    updateUrl({
      ...activeFilters,
      query: draftQuery,
      type: draftType,
      aspect: draftAspect,
      cursor: null,
      history: [],
    });
  };

  const clearFilters = () => {
    const nextFilters = {
      ...DEFAULT_COLLECTION_FILTERS,
      scope: activeFilters.scope,
    };
    setDraftQuery(nextFilters.query);
    setDraftType(nextFilters.type);
    setDraftAspect(nextFilters.aspect);
    updateUrl(nextFilters);
  };

  const updateScope = (scope: CollectionCardScope) => {
    updateUrl({
      ...activeFilters,
      scope,
      cursor: null,
      history: [],
    });
  };

  const updateItemPlayerCard = (item: PlayerCardCollectionItem, playerCard: PlayerCardDTO | null) => {
    setResponse((current) => {
      if (!current) return current;

      const itemKey = collectionItemKey(item);
      const nextItems = current.items.map((currentItem) => (
        collectionItemKey(currentItem) === itemKey
          ? { ...currentItem, playerCard }
          : currentItem
      ));
      const existingPlayerCardIndex = current.playerCards.findIndex((currentPlayerCard) => (
        currentPlayerCard.cardId === item.preview.card.id
          && currentPlayerCard.cardVersion === item.preview.card.version
      ));
      const nextPlayerCards = [...current.playerCards];
      if (playerCard) {
        if (existingPlayerCardIndex >= 0) {
          nextPlayerCards[existingPlayerCardIndex] = playerCard;
        } else {
          nextPlayerCards.push(playerCard);
        }
      } else if (existingPlayerCardIndex >= 0) {
        nextPlayerCards.splice(existingPlayerCardIndex, 1);
      }

      return {
        ...current,
        items: activeFilters.scope === 'collection'
          ? nextItems.filter((nextItem) => nextItem.playerCard)
          : nextItems,
        playerCards: nextPlayerCards,
        totalCards: activeFilters.scope === 'collection' && !playerCard
          ? Math.max(0, current.totalCards - 1)
          : current.totalCards,
      };
    });
  };

  if (!auth.ready || !profile.ready) {
    return (
      <DSPage>
        <DSSection.Card background="darkBrown" padding="thick">
          <div className={styles.loading}>
            <DSSpinner label="Loading collection" />
            <DSText.Body tone="muted">Loading your collection...</DSText.Body>
          </div>
        </DSSection.Card>
      </DSPage>
    );
  }

  if (!auth.user || !profile.user) {
    return (
      <DSPage>
        <DSSection.Card background="darkBrown" padding="thick">
          <DSSection.Heading>
            <DSText.Eyebrow>Your cards</DSText.Eyebrow>
            <DSText.Heading as="h1" size="2xl">Log in to view your collection</DSText.Heading>
          </DSSection.Heading>
          <DSSection.Text>
            <DSText.Body size="lg" tone="muted">
              Relicry saves collection records to your player profile so your cards are available across devices.
            </DSText.Body>
          </DSSection.Text>
          <DSSection.Actions>
            <DSButton label="Log in or sign up" onClick={() => setLoginOpen(true)} variant="primary" />
            <DSButton href="/cards" label="Browse cards" variant="ghost" />
          </DSSection.Actions>
        </DSSection.Card>
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </DSPage>
    );
  }

  const page = response?.page ?? 1;
  const totalPages = response?.totalPages ?? 1;
  const previousFilters: CollectionCardFilters = {
    ...activeFilters,
    cursor: activeFilters.history.at(-1) ?? null,
    history: activeFilters.history.slice(0, -1),
  };
  const nextFilters: CollectionCardFilters = {
    ...activeFilters,
    cursor: response?.nextCursor ?? null,
    history: [...activeFilters.history, activeFilters.cursor],
  };
  const items = response?.items ?? [];
  const showInitialLoading = loading && !response;

  return (
    <DSPage>
      <DSSection className={styles.browser}>
        <Suspense fallback={null}>
          <CollectionSearchParamsSync onFiltersChange={handleLocationFilters} />
        </Suspense>
        <DSLoadingOverlay loading={loading && !!response} error={response ? error : null} dismissError={setError} />

        <DSSection.Card background="darkBrown" padding="thick">
          <DSSection.Heading>
            <DSText.Eyebrow>Your cards</DSText.Eyebrow>
            <DSText.Heading as="h1" size="2xl">Collection</DSText.Heading>
          </DSSection.Heading>
          <DSSection.Text>
            <DSText.Body size="lg" tone="muted">
              Track cards you own, cards you want, and the details that matter for your physical collection.
            </DSText.Body>
          </DSSection.Text>
          <DSSection.Actions>
            <CardsToolbar
              query={draftQuery}
              type={draftType}
              aspect={draftAspect}
              typeOptions={CARD_TYPE_OPTIONS}
              aspectOptions={CARD_ASPECT_OPTIONS}
              onQueryChange={setDraftQuery}
              onTypeChange={setDraftType}
              onAspectChange={setDraftAspect}
              onApply={applyFilters}
              onClear={clearFilters}
              disabled={loading}
            />
          </DSSection.Actions>
          <div className={styles.scopeRow}>
            <DSSegmentedControl
              ariaLabel="Collection card scope"
              options={SCOPE_OPTIONS}
              value={activeFilters.scope}
              onChange={updateScope}
            />
          </div>
        </DSSection.Card>

        {error && !response ? (
          <DSSection.Card background="dark">
            <div className={styles.statePanel}>
              <DSText.Heading as="h2" size="xl">Collection unavailable</DSText.Heading>
              <DSText.Body tone="muted">{error}</DSText.Body>
              <DSButton label="Try again" onClick={() => loadCollection(activeFilters)} variant="primary" />
            </div>
          </DSSection.Card>
        ) : null}

        {showInitialLoading ? (
          <DSSection.Card background="dark">
            <div className={styles.loading}>
              <DSSpinner label="Loading saved cards" />
              <DSText.Body tone="muted">Gathering your saved cards...</DSText.Body>
            </div>
          </DSSection.Card>
        ) : null}

        {!error && response && items.length === 0 ? (
          <CollectionEmptyState scope={activeFilters.scope} />
        ) : null}

        {!error && items.length > 0 ? (
          <>
            <DSSection.Grid columns={3}>
              {items.map((item) => (
                <CollectionTile
                  item={item}
                  key={collectionItemKey(item)}
                  scope={activeFilters.scope}
                  onPlayerCardChange={(playerCard) => updateItemPlayerCard(item, playerCard)}
                />
              ))}
            </DSSection.Grid>
            <DSPagination>
              <DSPagination.Totals
                shown={items.length}
                total={response?.totalCards ?? 0}
                label={activeFilters.scope === 'collection' ? 'saved cards' : 'cards'}
              />
              <DSPagination.PageIndex page={page} totalPages={totalPages} />
              <DSPagination.Actions
                onPrevious={() => updateUrl(previousFilters)}
                onNext={() => updateUrl(nextFilters)}
                previousDisabled={page <= 1 || loading}
                nextDisabled={!response?.nextCursor || loading}
              />
            </DSPagination>
          </>
        ) : null}
      </DSSection>
    </DSPage>
  );
}

function CollectionSearchParamsSync({
  onFiltersChange,
}: Readonly<{
  onFiltersChange: (filters: CollectionCardFilters) => void;
}>) {
  const searchParams = useSearchParams();

  useEffect(() => {
    onFiltersChange(parseCollectionFilters(searchParams));
  }, [onFiltersChange, searchParams]);

  return null;
}

function CollectionTile({
  item,
  onPlayerCardChange,
  scope,
}: Readonly<{
  item: PlayerCardCollectionItem;
  onPlayerCardChange: (playerCard: PlayerCardDTO | null) => void;
  scope: CollectionCardScope;
}>) {
  const count = item.playerCard?.individuals.length ?? 0;
  const ownership = item.playerCard?.individuals[0]?.ownership ?? PlayerCardOwnership.Owned;
  const unsaved = !item.playerCard;

  return (
    <div className={styles.tile} data-unsaved={scope === 'all' && unsaved ? 'true' : undefined}>
      <div className={styles.badges} aria-label={unsaved ? 'Not saved' : `${ownershipLabel(ownership)}, ${count} saved`}>
        {unsaved ? (
          <span>Not saved</span>
        ) : (
          <>
            <span>{ownershipLabel(ownership)}</span>
            <span>{count}x</span>
          </>
        )}
      </div>
      <CardCollectionAction
        cardId={item.preview.card.id}
        cardVersionId={item.preview.card.version}
        initialPlayerCard={item.playerCard}
        loadInitialStatus={false}
        onPlayerCardChange={onPlayerCardChange}
        trigger={<CardPreviewItem as="button" className={styles.previewButton} item={item.preview} />}
      />
    </div>
  );
}

function CollectionEmptyState({ scope }: Readonly<{ scope: CollectionCardScope }>) {
  return (
    <DSSection.Card background="dark">
      <div className={styles.statePanel}>
        <CollectionIcon className={styles.stateIcon} />
        <DSText.Heading as="h2" size="xl">
          {scope === 'collection' ? 'No saved cards matched' : 'No cards matched'}
        </DSText.Heading>
        <DSText.Body tone="muted">
          {scope === 'collection'
            ? 'Try clearing filters, switch to all cards, or save a card to start building your collection.'
            : 'Try clearing filters or broadening your search.'}
        </DSText.Body>
        <DSButton href="/cards" label="Browse cards" variant="primary" />
      </div>
    </DSSection.Card>
  );
}

function collectionItemKey(item: PlayerCardCollectionItem) {
  return `${item.preview.card.id}:${item.preview.card.version}`;
}

function ownershipLabel(ownership: PlayerCardOwnership) {
  switch (ownership) {
    case PlayerCardOwnership.WishList:
      return 'Wishlist';
    case PlayerCardOwnership.LookingToBuy:
      return 'Buying';
    case PlayerCardOwnership.LookingToSell:
      return 'Selling';
    default:
      return 'Owned';
  }
}
