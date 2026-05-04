"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DSButton from '@/components/ds/DSButton';
import DSField from '@/components/ds/DSField';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';
import DSText from '@/components/ds/DSText';
import { AdminRole, hasRole } from '@/entities/AdminRole';
import { UniqueReward } from '@/entities/Reward';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useUser } from '@/lib/client/useUser';

type Props = Readonly<{
  eventId: string;
  level: number;
  uniqueRewards: UniqueReward[];
}>;

export default function RewardUniqueRewardsManager({ eventId, level, uniqueRewards }: Props) {
  const authUser = useAuthUser();
  const { user, ready } = useUser();
  const router = useRouter();
  const [count, setCount] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canManage = ready && hasRole(user?.adminRoles, AdminRole.EventAdmin);

  const runAdminAction = async (request: RequestInit) => {
    if (!authUser.ready || !authUser.user || loading) return;

    setLoading(true);
    setError(null);

    try {
      const token = await authUser.user.getIdToken();
      const res = await fetch('/api/admin/unique-rewards', {
        ...request,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || json?.details || `Request failed (${res.status})`);
      }
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Failed to update unique rewards.');
    } finally {
      setLoading(false);
    }
  };

  const onGenerate = async () => {
    const parsedCount = Number.parseInt(count, 10);
    if (!Number.isInteger(parsedCount) || parsedCount < 1) {
      setError('Count must be a whole number greater than 0.');
      return;
    }

    await runAdminAction({
      method: 'POST',
      body: JSON.stringify({ eventId, level, count: parsedCount }),
    });
  };

  const onUpdate = async (id: string, action: 'publish' | 'archive') => {
    await runAdminAction({
      method: 'PATCH',
      body: JSON.stringify({ id, action }),
    });
  };

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      <DSLoadingOverlay loading={loading} error={error} dismissError={setError} />
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <DSText.Heading as="h2" size="xl">Unique Rewards</DSText.Heading>
        <DSText.Body tone="muted">
          Individually printed reward cards for reward level {level}.
        </DSText.Body>
      </div>

      {canManage && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '10rem' }}>
            <DSField
              label="Generate Count"
              type="number"
              value={count}
              onChange={setCount}
            />
          </div>
          <DSButton label="Generate Unique Rewards" onClick={onGenerate} loading={loading} />
        </div>
      )}

      {uniqueRewards.length === 0 ? (
        <DSText.Body tone="muted">No unique rewards have been generated yet.</DSText.Body>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {uniqueRewards.map((uniqueReward) => (
            <article
              key={uniqueReward.id}
              style={{
                display: 'grid',
                gap: '0.5rem',
                padding: '1rem',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '0.75rem',
                background: 'var(--color-gray-50)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: '0.25rem' }}>
                  <DSText.Body weight="semibold">
                    <Link href={`/${uniqueReward.id}`}>{uniqueReward.id}</Link>
                  </DSText.Body>
                  <DSText.Caption>
                    {getUniqueRewardStatus(uniqueReward)}
                  </DSText.Caption>
                </div>
                <DSButton href={`/${uniqueReward.id}`} label="View Printed Reward" />
              </div>
              {canManage && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <DSButton label="Publish" onClick={() => onUpdate(uniqueReward.id, 'publish')} loading={loading} />
                  <DSButton label="Archive" onClick={() => onUpdate(uniqueReward.id, 'archive')} loading={loading} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function getUniqueRewardStatus(uniqueReward: UniqueReward): string {
  const status = uniqueReward.archived?.at
    ? `Archived ${formatDate(uniqueReward.archived.at)}`
    : uniqueReward.published?.at
      ? `Published ${formatDate(uniqueReward.published.at)}`
      : 'Draft';

  if (uniqueReward.claimed?.at) {
    return `${status} • Claimed ${formatDate(uniqueReward.claimed.at)}`;
  }

  return `${status} • Unclaimed`;
}

function formatDate(date: Date | string): string {
  const resolvedDate = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(resolvedDate);
}
