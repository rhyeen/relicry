'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/firebaseAuth';
import { authClient } from '@/lib/firebaseClient';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(authClient);
      router.push('/');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logo}>
          Relicry
        </Link>
        <nav className={styles.nav}>
          <Link href="/events" className={styles.navLink}>
            Events
          </Link>
        </nav>
      </div>
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
            <button
              onClick={handleSignOut}
              className={`${styles.button} goldButton`}
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className={`${styles.button} goldButton`}
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
