'use client';
import { getAuthClient, getGoogleAuthProvider } from '@/lib/client/firebaseClient';

export async function signInWithGoogle() {
  const [{ signInWithPopup }, auth, provider] = await Promise.all([
    import('firebase/auth'),
    getAuthClient(),
    getGoogleAuthProvider(),
  ]);
  await signInWithPopup(auth, provider);
}

export async function signOutUser() {
  const [{ signOut }, auth] = await Promise.all([
    import('firebase/auth'),
    getAuthClient(),
  ]);
  await signOut(auth);
}