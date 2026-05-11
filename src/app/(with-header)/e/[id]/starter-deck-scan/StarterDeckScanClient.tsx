'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DSButton from '@/components/ds/DSButton';
import DSField from '@/components/ds/DSField';
import DSForm from '@/components/ds/DSForm';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';
import DSSelect from '@/components/ds/DSSelect';
import DSSpinner from '@/components/ds/DSSpinner';
import DSText from '@/components/ds/DSText';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { parseScannedUserId } from '@/lib/scanQr';
import styles from './page.module.css';

type StarterOption = {
  id: string;
  title: string;
};

type StarterClaim = {
  id: string;
  title: string;
  obtainedAt: string;
  obtainedBy: string;
  atEventId: string;
};

type ScanData = {
  event: {
    id: string;
    title: string;
  };
  player?: {
    id: string;
    displayName: string;
    email: string;
  } | null;
  starterOptions?: StarterOption[];
  existingStarterDecks?: StarterClaim[];
};

type Props = Readonly<{
  eventId: string;
}>;

export default function StarterDeckScanClient({ eventId }: Props) {
  const auth = useAuthUser();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const lastScannedRef = useRef('');
  const [data, setData] = useState<ScanData | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [selectedStarterId, setSelectedStarterId] = useState('');
  const [scannedUserId, setScannedUserId] = useState('');
  const [proceedAnyway, setProceedAnyway] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('Starting camera scanner...');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScan = useCallback(async (userId?: string) => {
    if (!auth.user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const query = new URLSearchParams({ eventId });
      if (userId) query.set('userId', userId);
      const res = await fetch(`/api/admin/starter?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || `Unable to load scan (${res.status})`);
      }
      setData(json);
      setSelectedStarterId(json.starterOptions?.[0]?.id ?? '');
      setProceedAnyway(false);
      setClaimed(false);
      if (userId) setScannedUserId(userId);
    } catch (e) {
      setError((e as Error)?.message ?? 'Unable to load scan.');
    } finally {
      setLoading(false);
    }
  }, [auth.user, eventId]);

  useEffect(() => {
    if (auth.ready && auth.user) {
      loadScan();
    }
  }, [auth.ready, auth.user, loadScan]);

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
            const userId = parseScannedUserId(text);
            if (!userId || lastScannedRef.current === userId) return;
            lastScannedRef.current = userId;
            setManualInput(text);
            setCameraStatus('QR code scanned.');
            loadScan(userId);
          },
        );
        if (!cancelled) setCameraStatus('Point the camera at a Relicry player QR code.');
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
  }, [auth.ready, auth.user, loadScan]);

  const starterOptions = useMemo(() => (data?.starterOptions ?? []).map((starter) => ({
    label: starter.title,
    value: starter.id,
  })), [data?.starterOptions]);

  const submitManualScan = () => {
    const userId = parseScannedUserId(manualInput);
    if (!userId) {
      setError('Enter a valid /scan QR URL or raw user ID.');
      return;
    }
    lastScannedRef.current = userId;
    loadScan(userId);
  };

  const resetScan = () => {
    setScannedUserId('');
    setManualInput('');
    setProceedAnyway(false);
    setClaimed(false);
    lastScannedRef.current = '';
    loadScan();
  };

  const claimStarter = async () => {
    if (!auth.user || !selectedStarterId || !scannedUserId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch('/api/admin/starter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId,
          userId: scannedUserId,
          focusCardId: selectedStarterId,
          proceedAnyway,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 409 && json?.existingStarterDecks) {
        setData((current) => current ? {
          ...current,
          existingStarterDecks: json.existingStarterDecks,
        } : current);
        setProceedAnyway(false);
        return;
      }
      if (!res.ok) {
        throw new Error(json?.error || `Claim failed (${res.status})`);
      }
      setData((current) => current ? {
        ...current,
        player: json.player ?? current.player,
        existingStarterDecks: json.existingStarterDecks ?? current.existingStarterDecks,
      } : current);
      setClaimed(true);
      setProceedAnyway(false);
    } catch (e) {
      setError((e as Error)?.message ?? 'Claim failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!auth.ready) {
    return <Shell><DSSpinner label="Loading account" /></Shell>;
  }

  if (!auth.user) {
    return (
      <Shell>
        <DSText.Heading as="h1" size="2xl" className={styles.title}>Sign in required</DSText.Heading>
        <DSText.Body className={styles.copy}>Event admins must sign in before scanning starter deck QR codes.</DSText.Body>
        <DSButton href={`/login?next=${encodeURIComponent(`/e/${eventId}/starter-deck-scan`)}`} label="Sign In" variant="primary" />
      </Shell>
    );
  }

  const hasExisting = (data?.existingStarterDecks?.length ?? 0) > 0;
  const shouldBlockForExisting = !!data?.player && hasExisting && !proceedAnyway && !claimed;

  return (
    <Shell>
      <DSLoadingOverlay loading={loading} error={error} dismissError={setError} />
      <div className={styles.scan}>
        <div className={styles.scanHeader}>
          <div>
            <DSText.Eyebrow>Starter deck scan</DSText.Eyebrow>
            <DSText.Heading as="h1" size="2xl" className={styles.title}>
              {data?.event?.title ?? eventId}
            </DSText.Heading>
            <DSText.Body className={styles.copy}>
              Scan a player QR code or paste its URL to record a starter deck for this event.
            </DSText.Body>
          </div>
          {claimed && <span className={styles.success}>Claim recorded</span>}
        </div>

        <section className={styles.cameraPanel} aria-labelledby="camera-title">
          <DSText.Heading as="h2" size="xl" className={styles.title} id="camera-title">Camera scanner</DSText.Heading>
          <video ref={videoRef} className={styles.video} muted playsInline />
          <DSText.Caption>{cameraError ? cameraError : cameraStatus}</DSText.Caption>
        </section>

        <DSForm>
          <DSForm.Title>Manual fallback</DSForm.Title>
          <DSForm.Description>
            Paste a full `/scan?userId=...` QR URL or enter a raw `u/...` user ID.
          </DSForm.Description>
          <DSField
            label="QR URL or User ID"
            value={manualInput}
            onChange={setManualInput}
            placeholder="https://relicry.com/scan?userId=u%2F..."
          />
          <DSForm.ButtonGroup>
            <DSButton onClick={submitManualScan} label="Load Player" variant="primary" />
            {scannedUserId && <DSButton onClick={resetScan} label="Scan Another" variant="ghost" />}
          </DSForm.ButtonGroup>
        </DSForm>

        {data?.player && (
          <section className={styles.playerPanel} aria-labelledby="player-title">
            <div>
              <DSText.Eyebrow>Scanned player</DSText.Eyebrow>
              <DSText.Heading as="h2" size="xl" className={styles.title} id="player-title">
                {data.player.displayName || 'Player'}
              </DSText.Heading>
              <DSText.Caption>{data.player.id}</DSText.Caption>
            </div>

            {shouldBlockForExisting ? (
              <div className={styles.warning}>
                <DSText.Heading as="h3" size="lg" className={styles.title}>
                  This player already claimed a starter deck.
                </DSText.Heading>
                <StarterClaims claims={data.existingStarterDecks ?? []} />
                <DSButton onClick={() => setProceedAnyway(true)} label="Proceed Anyway" variant="primary" />
              </div>
            ) : (
              <DSForm>
                <DSForm.Title>Choose starter deck</DSForm.Title>
                <DSForm.Description>
                  Record the focus card for the starter deck this player chose.
                </DSForm.Description>
                {starterOptions.length === 0 ? (
                  <DSText.Body className={styles.copy}>
                    This event does not have starter decks configured yet.
                  </DSText.Body>
                ) : (
                  <>
                    <DSSelect
                      label="Starter Deck"
                      options={starterOptions}
                      value={selectedStarterId}
                      onChange={setSelectedStarterId}
                    />
                    <DSForm.ButtonGroup>
                      <DSButton
                        onClick={claimStarter}
                        label={proceedAnyway ? 'Record Additional Starter' : 'Record Starter Deck'}
                        variant="primary"
                        disabled={!selectedStarterId || claimed}
                        loading={loading}
                      />
                    </DSForm.ButtonGroup>
                  </>
                )}
              </DSForm>
            )}

            {hasExisting && !shouldBlockForExisting && (
              <div className={styles.existing}>
                <DSText.Heading as="h3" size="lg" className={styles.title}>Existing claims</DSText.Heading>
                <StarterClaims claims={data.existingStarterDecks ?? []} />
              </div>
            )}
          </section>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        {children}
      </section>
    </div>
  );
}

function StarterClaims({ claims }: Readonly<{ claims: StarterClaim[] }>) {
  return (
    <div className={styles.claims}>
      {claims.map((claim) => (
        <div className={styles.claim} key={`${claim.id}-${claim.obtainedAt}`}>
          <span>{claim.title}</span>
          <small>{formatDate(claim.obtainedAt)} at {claim.atEventId}</small>
        </div>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
