'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './HeaderClient.module.css';
import { useAuthUser } from '@/lib/client/useAuthUser';
import ProfileMenu from './ProfileMenu';

export default function Header() {
  const { user, ready } = useAuthUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!ready) return null;

  const currentPath = `${pathname}${searchParams?.toString() ? `?${searchParams}` : ''}`;

  return (
    <div className={styles.userContainer}>
      {user ? (
        <ProfileMenu displayName={user.displayName} photoURL={user.photoURL} />
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
