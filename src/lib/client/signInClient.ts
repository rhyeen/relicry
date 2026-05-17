'use client';

import { withAuth, getGoogleAuthProvider } from "@/lib/client/firebaseClient";
import type { User as FirebaseUser } from 'firebase/auth';

export async function signInWithGoogle() {
  const provider = await getGoogleAuthProvider();
  await withAuth(async ({ signInWithPopup }, auth) => {
    await signInWithPopup(auth, provider);
  });
}

export async function signInWithEmailPassword(email: string, password: string) {
  await withAuth(async ({ signInWithEmailAndPassword }, auth) => {
    await signInWithEmailAndPassword(auth, email, password);
  });
}

export async function createAccountWithEmailPassword({
  displayName,
  email,
  password,
}: {
  displayName: string;
  email: string;
  password: string;
}) {
  await withAuth(async ({ createUserWithEmailAndPassword, updateProfile }, auth) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const trimmedDisplayName = displayName.trim();
    if (trimmedDisplayName) {
      await updateProfile(credential.user, { displayName: trimmedDisplayName });
    }
    await syncRelicryProfile(credential.user, trimmedDisplayName, email);
  });
}

export async function signInWithLocalTestUser() {
  const res = await fetch('/api/local/test-login', {
    method: 'POST',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || typeof json?.token !== 'string') {
    throw new Error(json?.error || `Unable to prepare local test login (${res.status})`);
  }

  await withAuth(async ({ signInWithCustomToken }, auth) => {
    await signInWithCustomToken(auth, json.token);
  });
}

export async function sendPasswordReset(email: string) {
  await withAuth(async ({ sendPasswordResetEmail }, auth) => {
    await sendPasswordResetEmail(auth, email);
  });
}

export async function signOutUser() {
  await withAuth(async ({ signOut }, auth) => {
    await signOut(auth);
  });
}

async function syncRelicryProfile(user: FirebaseUser, displayName: string, email: string) {
  const token = await user.getIdToken();
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ displayName, email }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error || `Unable to create Relicry profile (${res.status})`);
  }
}
