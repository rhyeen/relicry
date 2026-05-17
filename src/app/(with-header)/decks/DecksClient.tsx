'use client';

import { useCallback, useEffect, useState } from 'react';
import CardPreviewItem from '@/components/CardPreviewItem';
import LoginDialog from '@/components/client/LoginDialog';
import DSActionMenu from '@/components/ds/DSActionMenu';
import DSButton from '@/components/ds/DSButton';
import DSDialog from '@/components/ds/DSDialog';
import DSField from '@/components/ds/DSField';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSSpinner from '@/components/ds/DSSpinner';
import DSText from '@/components/ds/DSText';
import { CollectionIcon, DeckTbdIcon, EditDetailsIcon, RemoveIcon } from '@/components/ds/DSNavIcons';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { DeckListItemDTO, DeckListResponse, DeckMutationResponse, getDeckHref, getDeckRouteId, LATEST_DECK_STORAGE_KEY } from '@/lib/decksApi';
import styles from './DecksClient.module.css';

const DEFAULT_NEW_DECK_NAME = 'New Deck';

export default function DecksClient() {
  const auth = useAuthUser();
  const [decks, setDecks] = useState<DeckListItemDTO[]>([]);
  const [latestDeckId, setLatestDeckId] = useState('');
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState(DEFAULT_NEW_DECK_NAME);
  const [renameDeck, setRenameDeck] = useState<DeckListItemDTO | null>(null);
  const [renameName, setRenameName] = useState('');

  const loadDecks = useCallback(async () => {
    if (!auth.user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch('/api/decks', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({})) as DeckListResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || `Unable to load decks (${res.status})`);
      setDecks(json.decks ?? []);
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message ?? 'Unable to load decks.');
    } finally {
      setLoading(false);
    }
  }, [auth.user]);

  useEffect(() => {
    setLatestDeckId(window.localStorage.getItem(LATEST_DECK_STORAGE_KEY) ?? '');
  }, []);

  useEffect(() => {
    if (auth.ready && auth.user) {
      loadDecks();
    }
  }, [auth.ready, auth.user, loadDecks]);

  const createDeck = async () => {
    if (!auth.user) return;
    setWorking(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: createName }),
      });
      const json = await res.json().catch(() => ({})) as DeckMutationResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || `Unable to create deck (${res.status})`);
      window.localStorage.setItem(LATEST_DECK_STORAGE_KEY, json.deck.id);
      setLatestDeckId(json.deck.id);
      setCreateOpen(false);
      setCreateName(DEFAULT_NEW_DECK_NAME);
      await loadDecks();
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message ?? 'Unable to create deck.');
    } finally {
      setWorking(false);
    }
  };

  const renameSelectedDeck = async () => {
    if (!auth.user || !renameDeck) return;
    setWorking(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch(`/api/decks/${encodeURIComponent(getDeckRouteId(renameDeck.deck.id))}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: renameName }),
      });
      const json = await res.json().catch(() => ({})) as DeckMutationResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || `Unable to rename deck (${res.status})`);
      setRenameDeck(null);
      await loadDecks();
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message ?? 'Unable to rename deck.');
    } finally {
      setWorking(false);
    }
  };

  const archiveDeck = async (deck: DeckListItemDTO) => {
    if (!auth.user) return;
    setWorking(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch(`/api/decks/${encodeURIComponent(getDeckRouteId(deck.deck.id))}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ archived: true }),
      });
      const json = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(json.error || `Unable to archive deck (${res.status})`);
      if (latestDeckId === deck.deck.id) {
        window.localStorage.removeItem(LATEST_DECK_STORAGE_KEY);
        setLatestDeckId('');
      }
      await loadDecks();
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message ?? 'Unable to archive deck.');
    } finally {
      setWorking(false);
    }
  };

  const openRename = (deck: DeckListItemDTO) => {
    setRenameDeck(deck);
    setRenameName(deck.deck.name);
  };

  if (!auth.ready) {
    return (
      <DSPage>
        <DSSection.Card background="darkBrown" padding="thick">
          <div className={styles.loading}>
            <DSSpinner label="Loading decks" />
            <DSText.Body tone="muted">Loading decks...</DSText.Body>
          </div>
        </DSSection.Card>
      </DSPage>
    );
  }

  if (!auth.user) {
    return (
      <DSPage>
        <DSSection.Card background="darkBrown" padding="thick">
          <DSSection.Heading>
            <DSText.Eyebrow>My decks</DSText.Eyebrow>
            <DSText.Heading as="h1" size="2xl">Log in to build decks</DSText.Heading>
          </DSSection.Heading>
          <DSSection.Text>
            <DSText.Body size="lg" tone="muted">
              Decks belong to your Relicry profile so you can keep building them across devices.
            </DSText.Body>
          </DSSection.Text>
          <DSSection.Actions>
            <DSButton label="Log in or sign up" onClick={() => setLoginOpen(true)} variant="primary" />
            <DSButton href="/collection" label="View collection" variant="ghost" />
          </DSSection.Actions>
        </DSSection.Card>
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </DSPage>
    );
  }

  return (
    <DSPage>
      <DSSection>
        <DSLoadingOverlay loading={loading && decks.length > 0} error={error} dismissError={setError} />
        <DSSection.Card background="darkBrown" padding="thick">
          <DSSection.Heading>
            <DSText.Eyebrow>My decks</DSText.Eyebrow>
            <DSText.Heading as="h1" size="2xl">Decks</DSText.Heading>
          </DSSection.Heading>
          <DSSection.Text>
            <DSText.Body size="lg" tone="muted">
              Name decks, scan cards into them, and keep your favorite builds close at hand.
            </DSText.Body>
          </DSSection.Text>
          <DSSection.Actions>
            <DSButton icon={<DeckTbdIcon />} label="Create deck" onClick={() => setCreateOpen(true)} variant="primary" />
            <DSButton href="/collection" icon={<CollectionIcon />} label="Collection" variant="ghost" />
          </DSSection.Actions>
        </DSSection.Card>

        {loading && decks.length === 0 ? (
          <DSSection.Card background="dark">
            <div className={styles.loading}>
              <DSSpinner label="Loading decks" />
              <DSText.Body tone="muted">Gathering your decks...</DSText.Body>
            </div>
          </DSSection.Card>
        ) : null}

        {!loading && decks.length === 0 ? (
          <DSSection.Card background="dark">
            <div className={styles.statePanel}>
              <DeckTbdIcon className={styles.stateIcon} />
              <DSText.Heading as="h2" size="xl">No decks yet</DSText.Heading>
              <DSText.Body tone="muted">Create a deck, then add cards from card pages or scan card QR codes from the deck editor.</DSText.Body>
              <DSButton label="Create deck" onClick={() => setCreateOpen(true)} variant="primary" />
            </div>
          </DSSection.Card>
        ) : null}

        {decks.length > 0 ? (
          <DSSection.Grid columns={3}>
            {decks.map((deck) => (
              <DeckTile
                deck={deck}
                isLatest={deck.deck.id === latestDeckId}
                key={deck.deck.id}
                onArchive={() => archiveDeck(deck)}
                onRename={() => openRename(deck)}
                working={working}
              />
            ))}
          </DSSection.Grid>
        ) : null}
      </DSSection>

      <DSDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onOpenChange={setCreateOpen}
        title="Create deck"
        content={(
          <DSField
            label="Deck name"
            value={createName}
            onChange={setCreateName}
            maxLength={80}
            autoComplete="off"
          />
        )}
        actions={(
          <>
            <DSButton label="Cancel" onClick={() => setCreateOpen(false)} variant="ghost" disabled={working} />
            <DSButton label="Create deck" onClick={createDeck} variant="primary" loading={working} />
          </>
        )}
      />

      <DSDialog
        open={!!renameDeck}
        onClose={() => setRenameDeck(null)}
        onOpenChange={(open) => {
          if (!open) setRenameDeck(null);
        }}
        title="Rename deck"
        content={(
          <DSField
            label="Deck name"
            value={renameName}
            onChange={setRenameName}
            maxLength={80}
            autoComplete="off"
          />
        )}
        actions={(
          <>
            <DSButton label="Cancel" onClick={() => setRenameDeck(null)} variant="ghost" disabled={working} />
            <DSButton label="Save name" onClick={renameSelectedDeck} variant="primary" loading={working} />
          </>
        )}
      />
    </DSPage>
  );
}

function DeckTile({
  deck,
  isLatest,
  onArchive,
  onRename,
  working,
}: Readonly<{
  deck: DeckListItemDTO;
  isLatest: boolean;
  onArchive: () => void;
  onRename: () => void;
  working: boolean;
}>) {
  return (
    <article className={styles.deckTile}>
      <div className={styles.deckHeader}>
        <div>
          {isLatest ? <span className={styles.latestBadge}>Latest deck</span> : null}
          <DSText.Heading as="h2" size="xl">{deck.deck.name}</DSText.Heading>
        </div>
        <DSActionMenu
          ariaLabel={`${deck.deck.name} actions`}
          trigger={<DSButton label="Actions" variant="ghost" />}
          items={[
            { label: 'Rename', icon: <EditDetailsIcon />, onClick: onRename },
            { label: 'Archive', destructive: true, disabled: working, icon: <RemoveIcon />, onClick: onArchive },
          ]}
        />
      </div>
      <div className={styles.stats}>
        <span>{deck.cardCount} cards</span>
        <span>{deck.uniqueCardCount} unique</span>
        <span>Updated {formatDate(deck.deck.updatedAt)}</span>
      </div>
      {deck.previews.length > 0 ? (
        <div className={styles.previewStrip}>
          {deck.previews.map((preview) => (
            <CardPreviewItem item={preview} key={`${preview.card.id}:${preview.card.version}`} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyPreview}>
          <DSText.Body tone="muted">No cards yet</DSText.Body>
        </div>
      )}
      <DSButton href={getDeckHref(deck.deck.id)} label="Open deck" variant="primary" />
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}
