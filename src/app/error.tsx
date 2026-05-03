'use client';

import DSText from '@/components/ds/DSText';
import { useEffect } from 'react';

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
    <div>
      <div>
        <DSText.Heading as="h2">Something went wrong!</DSText.Heading>
        <DSText.Body tone="muted">{error.message}</DSText.Body>
        <button
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
