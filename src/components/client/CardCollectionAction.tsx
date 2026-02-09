'use client';

import { PlayerCard } from '@/entities/PlayerCard';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useEffect, useMemo, useState } from 'react';

type Props = { cardId: string; cardVersionId: number };

export default function CardCollectionAction({ cardId, cardVersionId }: Props) {
  const { user, ready } = useAuthUser();

  const [playerCard, setPlayerCard] = useState<PlayerCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState<null | 'add' | 'addAnother'>(null);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(() => `${cardId}:${cardVersionId}`, [cardId, cardVersionId]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!ready || !user) return;

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const qs = new URLSearchParams({
          cardId,
          cardVersion: String(cardVersionId),
        });

        const res = await fetch(`/api/player-card?${qs}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (!res.ok) throw new Error(`GET failed: ${res.status}`);
        const json = await res.json();

        if (!cancelled) setPlayerCard(json.playerCard ?? null);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('Failed to load collection status.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [ready, user, cardId, cardVersionId, key]);

  if (!ready) return null;
  if (!user) return <div>Please log in to manage your collections.</div>;
  if (loading) return <div>Loading collection status…</div>;
  if (error) return <div>{error}</div>;

  if (!playerCard) {
    return (
      <button
        disabled={working === 'add'}
        onClick={async () => {
          setWorking('add');
          setError(null);
          try {
            const token = await user.getIdToken();
            const res = await fetch('/api/player-card', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ cardId, cardVersion: cardVersionId }),
            });

            if (!res.ok) throw new Error(`POST failed: ${res.status}`);
            const json = await res.json();
            setPlayerCard(json.playerCard);
          } catch (e) {
            console.error(e);
            setError('Failed to add card to collection.');
          } finally {
            setWorking(null);
          }
        }}
      >
        {working === 'add' ? 'Adding…' : 'Add to Collection'}
      </button>
    );
  }

  const count = Array.isArray(playerCard.individuals) ? playerCard.individuals.length : 0;

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <span>In Collection ({count})</span>

      <button
        disabled={working === 'addAnother'}
        onClick={async () => {
          setWorking('addAnother');
          setError(null);
          try {
            const token = await user.getIdToken();
            const res = await fetch('/api/player-card', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ cardId, cardVersion: cardVersionId }),
            });

            if (!res.ok) throw new Error(`POST failed: ${res.status}`);
            const json = await res.json();
            setPlayerCard(json.playerCard);
          } catch (e) {
            console.error(e);
            setError('Failed to add another copy.');
          } finally {
            setWorking(null);
          }
        }}
      >
        {working === 'addAnother' ? 'Adding…' : 'Add another'}
      </button>

      <button onClick={() => alert(`Detail UI coming next. You have ${count} copy/copies.`)}>
        View details
      </button>
    </div>
  );
}
