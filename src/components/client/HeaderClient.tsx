'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from './HeaderClient.module.css';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { signOutUser } from '@/lib/client/signInClient';

export default function Header() {
  const { user, ready } = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!ready) return null;

  const currentPath = `${pathname}${searchParams?.toString() ? `?${searchParams}` : ''}`;

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.refresh();
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <div className={styles.userContainer}>
      {user ? (
        <>
          {user.photoURL && (
            <Image
              src={user.photoURL}
              alt={user.displayName || 'User Avatar'}
              width={40}
              height={40}
              className={styles.avatar}
            />
          )}
          <span className={styles.displayName}>{user.displayName}</span>
          <button onClick={handleSignOut} className={`${styles.button} goldButton`}>
            Sign Out
          </button>
        </>
      ) : (
        <Link
          href={`/login?next=${encodeURIComponent(currentPath)}`}
          className={`${styles.button} goldButton`}
        >
          Login
        </Link>
      )}
    </div>
  );
}
