'use client';

import DSButton from '@/components/ds/DSButton';
import DSField from '@/components/ds/DSField';
import DSForm from '@/components/ds/DSForm';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import useIsEmulated from '@/lib/client/useIsEmulated';
import {
  DEFAULT_LOCAL_CARD_COUNT,
  MAX_LOCAL_CARD_COUNT,
  normalizeLocalCardCount,
} from '@/lib/localPopulate';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function LocalPage() {
  const [cardCount, setCardCount] = useState(String(DEFAULT_LOCAL_CARD_COUNT));
  const [isPopulating, setIsPopulating] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const isEmulated = useIsEmulated();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const normalizedCardCount = normalizeLocalCardCount(cardCount);
  const minimumApplied = cardCount.trim() !== '' && Number(cardCount) < DEFAULT_LOCAL_CARD_COUNT;
  const maximumApplied = Number(cardCount) > MAX_LOCAL_CARD_COUNT;
  const isBusy = isPopulating || isClearingCache;

  const clearCache = async () => {
    setIsClearingCache(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/local/flush-cache', { method: 'POST' });
      if (!res.ok) throw new Error(await getErrorMessage(res, `Cache clear failed: ${res.status}`));
      setSuccessMessage('Cleared the local cache and route cache. The next page load will fetch fresh emulator data.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsClearingCache(false);
    }
  };
  
  const populateLocal = async () => {
    setIsPopulating(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/local/populate-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardCount: normalizedCardCount }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : `Populate failed: ${res.status}`,
        );
      }
      const populatedCardCount =
        data && typeof data === 'object' && 'cardCount' in data
          ? normalizeLocalCardCount(data.cardCount)
          : normalizedCardCount;
      setCardCount(String(populatedCardCount));
      setSuccessMessage(`Seeded the emulator with ${populatedCardCount} featured cards and refreshed local caches.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsPopulating(false);
    }
  };

  useEffect(() => {
    if (isEmulated === false) {
      router.replace('/');
    }
  }, [isEmulated, router]);

  if (!isEmulated) {
    return (
      <DSSection>
        <DSForm.Description>
          Local options are only available when the Firebase emulators are enabled.
        </DSForm.Description>
      </DSSection>
    );
  }

  return (
    <DSSection>
      <DSLoadingOverlay loading={isBusy} error={error} dismissError={setError} />
      <div className={styles.page}>
        <div className={styles.group}>
          <DSForm.Title>Emulator Controls</DSForm.Title>
          <DSForm.Description className={styles.lead}>
            Seed sample data for the Firebase emulators and refresh cached pages without touching
            production data. This screen is meant for filling out local test environments quickly.
          </DSForm.Description>
        </div>

        {successMessage && (
          <DSText.Body className={styles.successMessage} tone="success" role="status">
            {successMessage}
          </DSText.Body>
        )}

        <div className={styles.group}>
          <DSText.Heading as="h2" size="xl">Populate sample data</DSText.Heading>
          <DSForm.Description>
            Seeds the normal local dataset and makes sure there are exactly the number of featured
            cards you request. The first {DEFAULT_LOCAL_CARD_COUNT} cards are the hand-authored examples
            we already use today; anything above that is generated placeholder data like
            {' '}<strong>Example Card 42</strong>.
          </DSForm.Description>
          <DSField
            label="Featured card count"
            type="number"
            value={cardCount}
            onChange={setCardCount}
            description={getPopulateDescription({
              normalizedCardCount,
              minimumApplied,
              maximumApplied,
            })}
          />
          <DSForm.ButtonGroup>
            <DSButton
              onClick={populateLocal}
              label={isPopulating ? 'Populating...' : `Populate ${normalizedCardCount} cards`}
              disabled={isBusy}
              loading={isPopulating}
            />
          </DSForm.ButtonGroup>
        </div>

        <div className={styles.group}>
          <DSText.Heading as="h2" size="xl">Refresh cached pages</DSText.Heading>
          <DSForm.Description>
            Clears the local cache and route cache without reseeding data. Use this when you want
            cached pages to pull the latest emulator data again.
          </DSForm.Description>
          <DSForm.Description>
            Populate already refreshes caches automatically, so this is mainly for cache-only resets.
          </DSForm.Description>
          <DSForm.ButtonGroup>
            <DSButton
              onClick={clearCache}
              label={isClearingCache ? 'Clearing cache...' : 'Clear cache only'}
              disabled={isBusy}
              loading={isClearingCache}
            />
          </DSForm.ButtonGroup>
        </div>
      </div>
    </DSSection>
  );
}

async function getErrorMessage(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    return data.error;
  }
  return fallback;
}

function getPopulateDescription(params: {
  normalizedCardCount: number;
  minimumApplied: boolean;
  maximumApplied: boolean;
}): string {
  if (params.minimumApplied) {
    return `Counts below ${DEFAULT_LOCAL_CARD_COUNT} are automatically raised to the minimum. Current target: ${params.normalizedCardCount} cards.`;
  }

  if (params.maximumApplied) {
    return `Counts above ${MAX_LOCAL_CARD_COUNT} are capped to keep local seeds manageable. Current target: ${params.normalizedCardCount} cards.`;
  }

  return `Generated cards are replaced or removed as needed so the total stays in sync. Current target: ${params.normalizedCardCount} cards.`;
}
