'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import styles from './HeaderClient.module.css';
import { SignInIcon } from '@/components/ds/DSNavIcons';
import DSSpinner from '@/components/ds/DSSpinner';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useUser } from '@/lib/client/useUser';
import ProfileMenu from './ProfileMenu';
import LoginDialog from './LoginDialog';

const RequiredDisplayNameDialog = dynamic(() => import('./RequiredDisplayNameDialog'), {
  ssr: false,
});

export default function Header() {
  const { user, ready } = useAuthUser();
  const { user: relicryUser, ready: relicryUserReady } = useUser();
  const [loginOpen, setLoginOpen] = useState(false);
  const [savedDisplayName, setSavedDisplayName] = useState<{
    accountKey: string;
    displayName: string;
  } | null>(null);
  const accountKey = relicryUser?.id ?? user?.uid ?? null;
  const displayName = savedDisplayName?.accountKey === accountKey
    ? savedDisplayName.displayName
    : relicryUser?.displayName ?? user?.displayName;
  const avatarUser = {
    displayName: displayName ?? '',
    profileImage: relicryUser?.profileImage,
  };

  if (!ready) {
    return (
      <div className={styles.userContainer}>
        <span className={styles.loadingIndicator}>
          <DSSpinner size="sm" label="Loading account" />
        </span>
      </div>
    );
  }

  return (
    <div className={styles.userContainer}>
      {user ? (
        <>
          <ProfileMenu avatarUser={avatarUser} displayName={displayName} />
          <RequiredDisplayNameDialog
            ready={relicryUserReady}
            user={relicryUser}
            onSaved={(nextDisplayName) => {
              if (accountKey) {
                setSavedDisplayName({ accountKey, displayName: nextDisplayName });
              }
            }}
          />
        </>
      ) : (
        <>
          <button
            type="button"
            className={`${styles.button} goldButton`}
            aria-label="Login"
            title="Login"
            onClick={() => setLoginOpen(true)}
          >
            <SignInIcon className={styles.buttonIcon} />
          </button>
          <LoginDialog
            open={loginOpen && !user}
            onOpenChange={setLoginOpen}
          />
        </>
      )}
    </div>
  );
}
