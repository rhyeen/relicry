'use client';

import { User } from '@/entities/User';
import { useEffect, useState } from 'react';
import { useAuthUser } from './useAuthUser';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const authUser = useAuthUser();
  const authUserReady = authUser.ready;
  const authUserUser = authUser.user;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!authUserReady) return;

      if (authUserUser) {
        const token = await authUserUser.getIdToken();
        const res = await fetch('/api/user', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
          method: 'POST',
        });
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setUser(json.user ?? null);
        } else {
          if (!cancelled) setUser(null);
        }
      } else {
        if (!cancelled) setUser(null);
      }

      if (!cancelled) setReady(true);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [authUserReady, authUserUser]);

  return { user, ready };
}
