'use client';

import useIsEmulated from '@/lib/client/useIsEmulated';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LocalPage() {
  const [isPopulated, setIsPopulated] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const isEmulated = useIsEmulated();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const clearCache = async () => {
    setIsClearingCache(true);
    setCacheCleared(false);
    setError(null);
    try {
      const res = await fetch('/api/flush-cache', { method: 'POST' });
      if (!res.ok) throw new Error(`Cache clear failed: ${res.status}`);
      setCacheCleared(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsClearingCache(false);
    }
  };
  
  const populateLocal = async () => {
    setIsPopulating(true);
    setIsPopulated(false);
    setError(null);
    try {
      const res = await fetch('/api/populate-local', { method: 'POST' });
      if (!res.ok) throw new Error(`Populate failed: ${res.status}`);
      setIsPopulated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsPopulating(false);
    }
  };

  useEffect(() => {
    if (isEmulated === false) {
      router.replace('/');
    }
  }, [isEmulated, router]);

  if (!isEmulated) {
    return <div>Local options are only available in emulated environments.</div>;
  }

  return (
    <div>
      <h1>Local Options</h1>
      <button onClick={populateLocal} disabled={isPopulating}>Populate Local Database</button>
      <button onClick={clearCache} disabled={isClearingCache}>Clear Cache</button>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {cacheCleared && <div>Cache cleared!</div>}
      {isPopulated && <div>Database populated!</div>}
    </div>
  );
}
