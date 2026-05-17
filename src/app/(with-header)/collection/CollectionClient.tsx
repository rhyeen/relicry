'use client';

import { useCallback, useEffect, useState } from 'react';
import CardPreviewItem from '@/components/CardPreviewItem';
import LoginDialog from '@/components/client/LoginDialog';
import DSButton from '@/components/ds/DSButton';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSSpinner from '@/components/ds/DSSpinner';
import DSText from '@/components/ds/DSText';
import { CollectionIcon, WarningIcon } from '@/components/ds/DSNavIcons';
import { getCardDocId } from '@/entities/Card';
import { PlayerCardOwnership } from '@/entities/PlayerCard';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useUser } from '@/lib/client/useUser';
import type { PlayerCardCollectionItem, PlayerCardListResponse } from '@/lib/playerCardsApi';
import styles from './CollectionClient.module.css';

export default function CollectionClient() {
  const auth = useAuthUser();
  const profile = useUser();
  const [items, setItems] = useState<PlayerCardCollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const loadCollection = useCallback(async () => {
    if (!auth.user) return;

    setLoading(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch('/api/player-card', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`GET failed: ${res.status}`);
      const json = await res.json() as PlayerCardListResponse;
      setItems(json.items ?? json.playerCards.map((playerCard) => ({ playerCard, preview: null })));
    } catch (e) {
      console.error(e);
      setError('Unable to load your collection. Refresh the page, or log out and back in if this keeps happening.');
    } finally {
      setLoading(false);
    }
  }, [auth.user]);

  useEffect(() => {
    if (auth.ready && profile.ready && auth.user && profile.user) {
      loadCollection();
    }
  }, [auth.ready, auth.user, loadCollection, profile.ready, profile.user]);

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

  return (
    <DSPage>
      <DSSection>
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
            <DSButton href="/cards" label="Browse cards" variant="primary" />
            <DSButton
              disabled={loading}
              icon={<CollectionIcon />}
              label={loading ? 'Refreshing...' : 'Refresh'}
              loading={loading}
              onClick={loadCollection}
              variant="ghost"
            />
          </DSSection.Actions>
        </DSSection.Card>

        {error ? (
          <DSSection.Card background="dark">
            <div className={styles.statePanel}>
              <WarningIcon className={styles.stateIcon} />
              <DSText.Heading as="h2" size="xl">Collection unavailable</DSText.Heading>
              <DSText.Body tone="muted">{error}</DSText.Body>
              <DSButton label="Try again" onClick={loadCollection} variant="primary" />
            </div>
          </DSSection.Card>
        ) : null}

        {!error && loading && items.length === 0 ? (
          <DSSection.Card background="dark">
            <div className={styles.loading}>
              <DSSpinner label="Loading saved cards" />
              <DSText.Body tone="muted">Gathering your saved cards...</DSText.Body>
            </div>
          </DSSection.Card>
        ) : null}

        {!error && !loading && items.length === 0 ? (
          <DSSection.Card background="dark">
            <div className={styles.statePanel}>
              <CollectionIcon className={styles.stateIcon} />
              <DSText.Heading as="h2" size="xl">No saved cards yet</DSText.Heading>
              <DSText.Body tone="muted">
                Open a card detail page and use the collection button in the bottom-right corner to save a copy or add it to your wishlist.
              </DSText.Body>
              <DSButton href="/cards" label="Find cards" variant="primary" />
            </div>
          </DSSection.Card>
        ) : null}

        {!error && items.length > 0 ? (
          <div className={styles.grid}>
            {items.map((item) => (
              <CollectionTile item={item} key={`${item.playerCard.cardId}:${item.playerCard.cardVersion}`} />
            ))}
          </div>
        ) : null}
      </DSSection>
    </DSPage>
  );
}

function CollectionTile({ item }: Readonly<{ item: PlayerCardCollectionItem }>) {
  const count = item.playerCard.individuals.length;
  const ownership = item.playerCard.individuals[0]?.ownership ?? PlayerCardOwnership.Owned;

  return (
    <div className={styles.tile}>
      <div className={styles.badges} aria-label={`${ownershipLabel(ownership)}, ${count} saved`}>
        <span>{ownershipLabel(ownership)}</span>
        <span>{count}x</span>
      </div>
      {item.preview ? (
        <CardPreviewItem item={item.preview} />
      ) : (
        <DSSection.Card background="dark">
          <DSText.Body>Card {item.playerCard.cardId}</DSText.Body>
          <DSText.Body tone="muted">Version {item.playerCard.cardVersion}</DSText.Body>
          <DSButton
            href={`/${getCardDocId(item.playerCard.cardId, item.playerCard.cardVersion)}`}
            label="Open card"
            variant="primary"
          />
        </DSSection.Card>
      )}
    </div>
  );
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
