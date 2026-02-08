'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import styles from './page.module.css';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { signInWithGoogle } from '@/lib/client/signInClient';

function sanitizeNext(nextValue: string | null): string {
  if (!nextValue) return "/";
  // Prevent open redirects: only allow internal paths
  if (!nextValue.startsWith("/")) return "/";
  // Optional: block protocol-relative URLs like //evil.com
  if (nextValue.startsWith("//")) return "/";
  return nextValue;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}

function LoginClient() {
  const { user, ready } = useAuthUser();
  const router = useRouter();
  const sp = useSearchParams();

  const nextPath = useMemo(() => sanitizeNext(sp.get("next")), [sp]);

  useEffect(() => {
    if (user) {
      router.replace(nextPath);
    }
  }, [user, router, nextPath]);

  if (!ready) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome to Relicry</h1>
        <p className={styles.subtitle}>Sign in to continue your adventure.</p>
        <button
          onClick={async () => {
            await signInWithGoogle();
            // No redirect here; the effect will run once `user` becomes non-null.
          }}
          className={`${styles.button} ${styles.goldButton}`}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
