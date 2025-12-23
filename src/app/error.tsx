'use client';

import { useEffect } from 'react';
import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Something went wrong!</h2>
        <p className={styles.message}>{error.message}</p>
        <button
          onClick={() => reset()}
          className={styles.button}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
