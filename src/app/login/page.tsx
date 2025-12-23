'use client';

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { authClient } from "@/lib/firebaseClient";
import { useAuth } from "@/lib/firebaseAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from './page.module.css';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(authClient, provider);
      router.push("/");
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome to Relicry</h1>
        <p className={styles.subtitle}>Sign in to continue your adventure.</p>
        <button
          onClick={handleSignIn}
          className={`${styles.button} ${styles.goldButton}`}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
