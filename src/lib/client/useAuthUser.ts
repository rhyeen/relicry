'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { subscribeAuth } from '@/lib/client/authStore';

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAuth((u) => {
      setUser(u);
      setReady(true);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return { user, ready };
}
