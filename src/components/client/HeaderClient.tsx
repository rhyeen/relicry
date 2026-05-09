'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './HeaderClient.module.css';
import { SignInIcon } from '@/components/ds/DSNavIcons';
import DSSpinner from '@/components/ds/DSSpinner';
import { useAuthUser } from '@/lib/client/useAuthUser';
import ProfileMenu from './ProfileMenu';

export default function Header() {
  const { user, ready } = useAuthUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!ready) {
    return (
      <div className={styles.userContainer}>
        <span className={styles.loadingIndicator}>
          <DSSpinner size="sm" label="Loading account" />
        </span>
      </div>
    );
  }

  const currentPath = `${pathname}${searchParams?.toString() ? `?${searchParams}` : ''}`;

  return (
    <div className={styles.userContainer}>
      {user ? (
        <ProfileMenu displayName={user.displayName} photoURL={user.photoURL} />
      ) : (
        <Link
          href={`/login?next=${encodeURIComponent(currentPath)}`}
          className={`${styles.button} goldButton`}
          aria-label="Login"
          title="Login"
        >
          <SignInIcon className={styles.buttonIcon} />
        </Link>
      )}
    </div>
  );
}
