'use client';

import type { User } from 'firebase/auth';
import { getAuthClient } from '@/lib/client/firebaseClient';

type Listener = (user: User | null) => void;

let currentUser: User | null = null;
const listeners = new Set<Listener>();
let started = false;

export function subscribeAuth(listener: Listener) {
  listeners.add(listener);
  listener(currentUser);

  if (!started) {
    started = true;
    void (async () => {
      const [{ onAuthStateChanged }, auth] = await Promise.all([
        import('firebase/auth'),
        getAuthClient(),
      ]);

      onAuthStateChanged(auth, (u) => {
        currentUser = u;
        for (const l of listeners) l(u);
      });
    })();
  }

  return () => listeners.delete(listener);
}
