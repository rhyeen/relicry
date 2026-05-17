'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import DSButton from '@/components/ds/DSButton';
import DSDialog from '@/components/ds/DSDialog';
import DSField from '@/components/ds/DSField';
import DSForm from '@/components/ds/DSForm';
import { SignOutIcon } from '@/components/ds/DSNavIcons';
import type { User } from '@/entities/User';
import {
  DISPLAY_NAME_MAX_LENGTH,
  getDisplayNameValidationError,
  normalizeDisplayName,
} from '@/lib/displayName';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { reloadCurrentPage } from '@/lib/client/pageRefresh';
import { signOutUser } from '@/lib/client/signInClient';
import styles from './RequiredDisplayNameDialog.module.css';

type RequiredDisplayNameDialogProps = Readonly<{
  user: User | null;
  ready: boolean;
  onSaved?: (displayName: string) => void;
}>;

export default function RequiredDisplayNameDialog({
  user,
  ready,
  onSaved,
}: RequiredDisplayNameDialogProps) {
  const auth = useAuthUser();
  const [displayNameDraft, setDisplayNameDraft] = useState<{
    userId: string;
    displayName: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorState, setErrorState] = useState<{
    userId: string;
    message: string;
  } | null>(null);
  const [savedDisplayName, setSavedDisplayName] = useState<{
    userId: string;
    displayName: string;
  } | null>(null);
  const userId = user?.id ?? '';
  const displayName = displayNameDraft?.userId === userId
    ? displayNameDraft.displayName
    : user?.displayName ?? '';
  const error = errorState?.userId === userId ? errorState.message : null;
  const currentDisplayName = savedDisplayName?.userId === userId
    ? savedDisplayName.displayName
    : user?.displayName ?? '';
  const open = ready && !!user && !currentDisplayName.trim();
  const fieldError = error ?? undefined;

  const setError = (message: string | null) => {
    setErrorState(message && userId ? { userId, message } : null);
  };

  const saveDisplayName = async () => {
    const nextDisplayName = normalizeDisplayName(displayName);
    const displayNameError = getDisplayNameValidationError(nextDisplayName);
    if (displayNameError) {
      setError(displayNameError);
      return;
    }
    if (!auth.user) {
      setError('Your session expired. Sign in again to save a display name.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName: nextDisplayName }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || `Unable to save display name (${res.status})`);
      }
      setSavedDisplayName({ userId, displayName: nextDisplayName });
      onSaved?.(nextDisplayName);
      reloadCurrentPage();
    } catch (e) {
      setError((e as Error)?.message ?? 'Unable to save display name.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void saveDisplayName();
  };

  const handleSignOut = async () => {
    setSaving(true);
    setError(null);
    try {
      await signOutUser();
    } catch (e) {
      setError((e as Error)?.message ?? 'Unable to sign out.');
      setSaving(false);
    }
  };

  return (
    <DSDialog
      open={open}
      onOpenChange={() => undefined}
      disablePointerDismissal
      loading={saving}
      title="Choose a Display Name"
      description="Relicry needs a display name to identify you to event staff and other players. It does not need to be your real name."
      content={
        <DSForm onSubmit={handleSubmit} width="full">
          <div className={styles.content}>
            <DSField
              autoComplete="nickname"
              error={fieldError}
              label="Display Name"
              maxLength={DISPLAY_NAME_MAX_LENGTH}
              onChange={(value) => {
                if (userId) {
                  setDisplayNameDraft({ userId, displayName: value });
                }
                if (error) setError(null);
              }}
              value={displayName}
            />
            <div className={styles.actions}>
              <DSButton
                icon={<SignOutIcon />}
                label="Sign Out"
                onClick={handleSignOut}
                variant="ghost"
              />
              <DSButton
                label="Save Name"
                loading={saving}
                submitOnEnter
                type="submit"
                variant="primary"
              />
            </div>
          </div>
        </DSForm>
      }
    />
  );
}
