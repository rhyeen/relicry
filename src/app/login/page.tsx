'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from './page.module.css';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { signInWithGoogle } from '@/lib/client/signInClient';

export default function LoginPage() {
  const { user, ready } = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  if (!ready) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome to Relicry</h1>
        <p className={styles.subtitle}>Sign in to continue your adventure.</p>
        <button
          onClick={signInWithGoogle}
          className={`${styles.button} ${styles.goldButton}`}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
