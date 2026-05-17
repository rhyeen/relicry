'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import CardPreviewItem from '@/components/CardPreviewItem';
import LoginDialog from '@/components/client/LoginDialog';
import DSButton from '@/components/ds/DSButton';
import DSDialog from '@/components/ds/DSDialog';
import DSField from '@/components/ds/DSField';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSSpinner from '@/components/ds/DSSpinner';
import DSText from '@/components/ds/DSText';
import { AddToCollectionIcon, CollectionIcon, DeckTbdIcon, EditDetailsIcon, RemoveIcon } from '@/components/ds/DSNavIcons';
import { useAuthUser } from '@/lib/client/useAuthUser';
import {
  DeckCollectionImportResponse,
  DeckDetailResponse,
  DeckMutationResponse,
  getDeckRouteId,
  LATEST_DECK_STORAGE_KEY,
} from '@/lib/decksApi';
import { parseScannedCardPath } from '@/lib/scanQr';
import styles from './DeckDetailClient.module.css';

type Props = Readonly<{
  deckId: string;
}>;

export default function DeckDetailClient({ deckId }: Props) {
  const auth = useAuthUser();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const lastScannedRef = useRef('');
  const [detail, setDetail] = useState<DeckDetailResponse | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState('');
  const [cameraStatus, setCameraStatus] = useState('Camera scanner starting. Manual fallback is ready below.');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [importResult, setImportResult] = useState<DeckCollectionImportResponse | null>(null);

  const loadDeck = useCallback(async () => {
    if (!auth.user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch(`/api/decks/${encodeURIComponent(getDeckRouteId(deckId))}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({})) as DeckDetailResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || `Unable to load deck (${res.status})`);
      setDetail(json);
      setRenameName(json.deck.name);
      window.localStorage.setItem(LATEST_DECK_STORAGE_KEY, json.deck.id);
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message ?? 'Unable to load deck.');
    } finally {
      setLoading(false);
    }
  }, [auth.user, deckId]);

  useEffect(() => {
    if (auth.ready && auth.user) {
      loadDeck();
    }
  }, [auth.ready, auth.user, loadDeck]);

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
      if (!auth.ready || !auth.user || !videoRef.current) return;

      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        const reader = new BrowserQRCodeReader();
        controlsRef.current = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            const text = result?.getText();
            if (!text) return;
            const parsed = parseScannedCardPath(text);
            if (!parsed || lastScannedRef.current === parsed.cardPathId) return;
            lastScannedRef.current = parsed.cardPathId;
            setManualInput(text);
            setCameraStatus('Card QR code scanned.');
            addCard(parsed.cardId, parsed.cardVersion);
          },
        );
        if (!cancelled) setCameraStatus('Point the camera at a Relicry card QR code.');
      } catch (e) {
        if (!cancelled) {
          setCameraError((e as Error)?.message ?? 'Camera scanner unavailable.');
          setCameraStatus('Use the manual fallback below.');
        }
      }
    }

    startScanner();
    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [auth.ready, auth.user]);

  const addCard = async (cardId: string, cardVersion: number, quantity = 1) => {
    if (!auth.user) return;
    setWorking(true);
    setError(null);
    setImportResult(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch(`/api/decks/${encodeURIComponent(getDeckRouteId(deckId))}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId, cardVersion, quantity }),
      });
      const json = await res.json().catch(() => ({})) as DeckMutationResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || `Unable to add card (${res.status})`);
      await loadDeck();
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message ?? 'Unable to add card.');
    } finally {
      setWorking(false);
    }
  };

  const removeCard = async (cardId: string, cardVersion: number, removeAll: boolean) => {
    if (!auth.user) return;
    setWorking(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch(`/api/decks/${encodeURIComponent(getDeckRouteId(deckId))}/cards`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId, cardVersion, quantity: 1, removeAll }),
      });
      const json = await res.json().catch(() => ({})) as DeckMutationResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || `Unable to remove card (${res.status})`);
      await loadDeck();
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message ?? 'Unable to remove card.');
    } finally {
      setWorking(false);
    }
  };

  const submitManualScan = () => {
    const parsed = parseScannedCardPath(manualInput);
    if (!parsed) {
      setError('Enter a valid card QR URL such as /c/0003/1.');
      return;
    }
    lastScannedRef.current = parsed.cardPathId;
    addCard(parsed.cardId, parsed.cardVersion);
  };

  const saveName = async () => {
    if (!auth.user) return;
    setWorking(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch(`/api/decks/${encodeURIComponent(getDeckRouteId(deckId))}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: renameName }),
      });
      const json = await res.json().catch(() => ({})) as DeckMutationResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || `Unable to rename deck (${res.status})`);
      setRenameOpen(false);
      await loadDeck();
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message ?? 'Unable to rename deck.');
    } finally {
      setWorking(false);
    }
  };

  const archiveDeck = async () => {
    if (!auth.user) return;
    setWorking(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch(`/api/decks/${encodeURIComponent(getDeckRouteId(deckId))}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ archived: true }),
      });
      const json = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(json.error || `Unable to archive deck (${res.status})`);
      window.localStorage.removeItem(LATEST_DECK_STORAGE_KEY);
      router.push('/decks');
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message ?? 'Unable to archive deck.');
    } finally {
      setWorking(false);
    }
  };

  const importToCollection = async () => {
    if (!auth.user) return;
    setWorking(true);
    setError(null);
    setImportResult(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch(`/api/decks/${encodeURIComponent(getDeckRouteId(deckId))}/collection-import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({})) as DeckCollectionImportResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || `Unable to import cards (${res.status})`);
      setImportResult(json);
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message ?? 'Unable to import deck cards.');
    } finally {
      setWorking(false);
    }
  };

  const cardCountLabel = useMemo(() => (
    detail ? `${detail.cardCount} cards, ${detail.uniqueCardCount} unique` : ''
  ), [detail]);

  if (!auth.ready) {
    return (
      <DSPage>
        <DSSection.Card background="darkBrown" padding="thick">
          <div className={styles.loading}>
            <DSSpinner label="Loading deck" />
            <DSText.Body tone="muted">Loading deck...</DSText.Body>
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
            <DSText.Eyebrow>Deck editor</DSText.Eyebrow>
            <DSText.Heading as="h1" size="2xl">Log in to edit this deck</DSText.Heading>
          </DSSection.Heading>
          <DSSection.Text>
            <DSText.Body size="lg" tone="muted">Deck editing is available to the deck owner.</DSText.Body>
          </DSSection.Text>
          <DSSection.Actions>
            <DSButton label="Log in or sign up" onClick={() => setLoginOpen(true)} variant="primary" />
            <DSButton href="/decks" label="My decks" variant="ghost" />
          </DSSection.Actions>
        </DSSection.Card>
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </DSPage>
    );
  }

  return (
    <DSPage>
      <DSPage.Back href="/decks" label="Back to decks" />
      <DSSection>
        <DSLoadingOverlay loading={loading && !!detail} error={error} dismissError={setError} />
        <DSSection.Card background="darkBrown" padding="thick">
          <DSSection.Heading>
            <DSText.Eyebrow>Deck editor</DSText.Eyebrow>
            <DSText.Heading as="h1" size="2xl">{detail?.deck.name ?? 'Deck'}</DSText.Heading>
          </DSSection.Heading>
          <DSSection.Text>
            <DSText.Body size="lg" tone="muted">{cardCountLabel || 'Load, scan, and manage cards for this deck.'}</DSText.Body>
          </DSSection.Text>
          <DSSection.Actions>
            <DSButton icon={<EditDetailsIcon />} label="Rename" onClick={() => setRenameOpen(true)} variant="secondary" disabled={!detail} />
            <DSButton icon={<AddToCollectionIcon />} label="Add all missing to collection" onClick={importToCollection} variant="primary" disabled={!detail || detail.entries.length === 0} loading={working} />
            <DSButton icon={<RemoveIcon />} label="Archive" onClick={archiveDeck} variant="ghost" disabled={!detail || working} />
          </DSSection.Actions>
          {importResult ? (
            <div className={styles.notice}>
              <DSText.Body>
                Added {importResult.created} missing cards. {importResult.existing} already existed.
              </DSText.Body>
            </div>
          ) : null}
        </DSSection.Card>

        {loading && !detail ? (
          <DSSection.Card background="dark">
            <div className={styles.loading}>
              <DSSpinner label="Loading deck cards" />
              <DSText.Body tone="muted">Gathering deck cards...</DSText.Body>
            </div>
          </DSSection.Card>
        ) : null}

        {detail ? (
          <>
            <DSSection.Card background="dark">
              <div className={styles.scanLayout}>
                <div>
                  <DSText.Heading as="h2" size="xl">Add cards by QR</DSText.Heading>
                  <DSText.Body tone="muted">
                    Scan a Relicry card QR code or paste the card URL. Deck and focus cards can be added.
                  </DSText.Body>
                </div>
                <video ref={videoRef} className={styles.video} muted playsInline />
                <DSText.Caption>{cameraError ? cameraError : cameraStatus}</DSText.Caption>
                <div className={styles.manualRow}>
                  <DSField
                    label="Card QR URL"
                    value={manualInput}
                    onChange={setManualInput}
                    placeholder="https://relicry.com/c/0003/1"
                    autoComplete="off"
                  />
                  <DSButton label="Add card" onClick={submitManualScan} variant="primary" loading={working} />
                </div>
              </div>
            </DSSection.Card>

            {detail.entries.length === 0 ? (
              <DSSection.Card background="dark">
                <div className={styles.emptyState}>
                  <DeckTbdIcon className={styles.stateIcon} />
                  <DSText.Heading as="h2" size="xl">No cards yet</DSText.Heading>
                  <DSText.Body tone="muted">Scan a card QR code or add a card from its collection action menu.</DSText.Body>
                </div>
              </DSSection.Card>
            ) : (
              <DSSection.Grid columns={3}>
                {detail.entries.map((entry) => (
                  <article className={styles.cardTile} key={entry.cardPathId}>
                    <div className={styles.countBadge}>{entry.count}x</div>
                    <CardPreviewItem item={entry.preview} />
                    <div className={styles.cardActions}>
                      <DSButton label="+1" onClick={() => addCard(entry.cardId, entry.cardVersion)} variant="secondary" disabled={working} />
                      <DSButton label="-1" onClick={() => removeCard(entry.cardId, entry.cardVersion, false)} variant="ghost" disabled={working} />
                      <DSButton label="Remove" onClick={() => removeCard(entry.cardId, entry.cardVersion, true)} variant="ghost" disabled={working} />
                    </div>
                  </article>
                ))}
              </DSSection.Grid>
            )}
          </>
        ) : null}
      </DSSection>

      <DSDialog
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        onOpenChange={setRenameOpen}
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
            <DSButton label="Cancel" onClick={() => setRenameOpen(false)} variant="ghost" disabled={working} />
            <DSButton label="Save name" onClick={saveName} variant="primary" loading={working} />
          </>
        )}
      />
    </DSPage>
  );
}
