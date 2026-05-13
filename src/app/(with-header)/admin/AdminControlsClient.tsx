'use client';

import { useState } from 'react';
import DSButton from '@/components/ds/DSButton';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { AdminRole, hasRole } from '@/entities/AdminRole';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useUser } from '@/lib/client/useUser';
import styles from './page.module.css';

type ReindexAction = {
  id: string;
  label: string;
  endpoint: string;
  resultKey: string;
  collectionLabel: string;
};

const reindexActions: ReindexAction[] = [
  {
    id: 'cards',
    label: 'Reindex Cards',
    endpoint: '/api/admin/cards/reindex',
    resultKey: 'updatedCards',
    collectionLabel: 'cards',
  },
  {
    id: 'art',
    label: 'Reindex Art',
    endpoint: '/api/admin/art/reindex',
    resultKey: 'updatedArts',
    collectionLabel: 'art entries',
  },
  {
    id: 'artists',
    label: 'Reindex Artists',
    endpoint: '/api/admin/artists/reindex',
    resultKey: 'updatedArtists',
    collectionLabel: 'artists',
  },
];

const adminLinks = [
  { href: '/cards/new', label: 'New Card' },
  { href: '/art/new', label: 'New Art' },
  { href: '/ast/new', label: 'New Artist' },
  { href: '/events/new', label: 'New Event' },
  { href: '/q/new', label: 'New Quest' },
  { href: '/events', label: 'Manage Events' },
];

export default function AdminControlsClient() {
  const auth = useAuthUser();
  const { user, ready } = useUser();
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const canUseAdminControls = ready && hasRole(user?.adminRoles, AdminRole.SuperAdmin);

  const runReindex = async (action: ReindexAction) => {
    setBusyAction(action.id);
    setError(null);
    setSuccess(null);

    try {
      const token = await auth.user?.getIdToken();
      if (!token) {
        throw new Error('You must be signed in as a SuperAdmin to reindex collections.');
      }

      const res = await fetch(action.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(getErrorMessage(data, `${action.label} failed: ${res.status}`));
      }

      const count = getResultCount(data, action.resultKey);
      setSuccess(`Reindexed ${count} ${action.collectionLabel}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusyAction(null);
    }
  };

  if (!ready) {
    return (
      <DSSection.Card>
        <DSText.Body tone="muted">Loading admin permissions...</DSText.Body>
      </DSSection.Card>
    );
  }

  if (!canUseAdminControls) {
    return (
      <DSSection.Card>
        <DSSection.Heading>
          <DSText.Heading as="h2" size="xl">SuperAdmin Required</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body tone="muted">
            These controls are only available to SuperAdmins.
          </DSText.Body>
        </DSSection.Text>
      </DSSection.Card>
    );
  }

  return (
    <>
      <DSLoadingOverlay loading={!!busyAction} error={error} dismissError={setError} />

      <DSSection.Card>
        <DSSection.Heading>
          <DSText.Heading as="h2" size="xl">Collection Indexes</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body tone="muted">
            Rewrite collection documents so derived query fields and search indexes are refreshed.
          </DSText.Body>
          {success && (
            <DSText.Body className={styles.successMessage} role="status" tone="success">
              {success}
            </DSText.Body>
          )}
        </DSSection.Text>
        <DSSection.Actions>
          {reindexActions.map((action) => (
            <DSButton
              disabled={!!busyAction || !auth.ready}
              key={action.id}
              label={busyAction === action.id ? 'Reindexing...' : action.label}
              loading={busyAction === action.id}
              onClick={() => { void runReindex(action); }}
            />
          ))}
        </DSSection.Actions>
      </DSSection.Card>

      <DSSection.Card>
        <DSSection.Heading>
          <DSText.Heading as="h2" size="xl">Admin Workflows</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body tone="muted">
            Common creation and management links from the current admin surface.
          </DSText.Body>
        </DSSection.Text>
        <DSSection.Actions>
          {adminLinks.map((link) => (
            <DSButton href={link.href} key={link.href} label={link.label} />
          ))}
        </DSSection.Actions>
      </DSSection.Card>
    </>
  );
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    return data.error;
  }

  return fallback;
}

function getResultCount(data: unknown, resultKey: string): number {
  if (data && typeof data === 'object' && resultKey in data) {
    const count = Number((data as Record<string, unknown>)[resultKey]);
    if (Number.isFinite(count)) return count;
  }

  return 0;
}
