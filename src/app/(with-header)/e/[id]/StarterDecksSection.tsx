'use client';

import { useEffect, useState } from 'react';
import DSButton from '@/components/ds/DSButton';
import DSSection from '@/components/ds/DSSection';
import DSSpinner from '@/components/ds/DSSpinner';
import DSText from '@/components/ds/DSText';
import { AdminRole, hasRole } from '@/entities/AdminRole';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useUser } from '@/lib/client/useUser';
import styles from './page.module.css';

type StarterDeck = {
  id: string;
  title: string;
};

type StarterDeckResponse = {
  starterOptions?: StarterDeck[];
};

type Props = Readonly<{
  eventId: string;
}>;

export default function StarterDecksSection({ eventId }: Props) {
  const auth = useAuthUser();
  const { user, ready: userReady } = useUser();
  const [starterDecks, setStarterDecks] = useState<StarterDeck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canView = userReady && hasRole(user?.adminRoles, AdminRole.EventAdmin);

  useEffect(() => {
    let cancelled = false;

    async function loadStarterDecks() {
      if (!canView || !auth.user) return;
      setLoading(true);
      setError(null);

      try {
        const token = await auth.user.getIdToken();
        const query = new URLSearchParams({ eventId });
        const res = await fetch(`/api/admin/starter?${query.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const json = await res.json().catch(() => ({})) as StarterDeckResponse & { error?: string };

        if (!res.ok) {
          throw new Error(json.error || `Unable to load starter decks (${res.status})`);
        }
        if (!cancelled) {
          setStarterDecks(json.starterOptions ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error)?.message ?? 'Unable to load starter decks.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStarterDecks();
    return () => {
      cancelled = true;
    };
  }, [auth.user, canView, eventId]);

  if (!userReady || !canView) {
    return null;
  }

  return (
    <DSSection className={styles.starterDecksSection}>
      <DSSection.Heading>
        <DSText.Eyebrow>Event admin</DSText.Eyebrow>
        <DSText.Heading as="h2" size="xl">Starter decks</DSText.Heading>
      </DSSection.Heading>
      {loading ? (
        <DSSection.Card>
          <DSSpinner label="Loading starter decks" />
        </DSSection.Card>
      ) : error ? (
        <DSSection.Card>
          <DSText.Body tone="muted">{error}</DSText.Body>
        </DSSection.Card>
      ) : starterDecks.length === 0 ? (
        <DSSection.Card>
          <DSText.Body tone="muted">No starter decks are configured for this event.</DSText.Body>
        </DSSection.Card>
      ) : (
        <div className={styles.starterDeckGrid}>
          {starterDecks.map((starterDeck) => (
            <StarterDeckCard key={starterDeck.id} starterDeck={starterDeck} />
          ))}
        </div>
      )}
    </DSSection>
  );
}

function StarterDeckCard({
  starterDeck,
}: Readonly<{
  starterDeck: StarterDeck;
}>) {
  return (
    <article className={styles.starterDeckCard}>
      <span className={styles.starterDeckLevel}>Starter deck</span>
      <DSText.Heading as="h3" size="lg" className={styles.starterDeckTitle}>
        {starterDeck.title}
      </DSText.Heading>
      <DSSection.Text>
        <DSText.Caption>{starterDeck.id}</DSText.Caption>
      </DSSection.Text>
      <DSSection.Actions>
        <DSButton href={`/${starterDeck.id}`} label="View Focus Card" />
      </DSSection.Actions>
    </article>
  );
}
