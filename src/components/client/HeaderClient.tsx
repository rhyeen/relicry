'use client';

import { useState } from 'react';
import styles from './HeaderClient.module.css';
import { SignInIcon } from '@/components/ds/DSNavIcons';
import DSSpinner from '@/components/ds/DSSpinner';
import { useAuthUser } from '@/lib/client/useAuthUser';
import ProfileMenu from './ProfileMenu';
import LoginDialog from './LoginDialog';

export default function Header() {
  const { user, ready } = useAuthUser();
  const [loginOpen, setLoginOpen] = useState(false);

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
        <ProfileMenu displayName={user.displayName} photoURL={user.photoURL} />
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
