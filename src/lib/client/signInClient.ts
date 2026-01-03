'use client';

import { withAuth, getGoogleAuthProvider } from "@/lib/client/firebaseClient";

export async function signInWithGoogle() {
  const provider = await getGoogleAuthProvider();
  await withAuth(async ({ signInWithPopup }, auth) => {
    await signInWithPopup(auth, provider);
  });
}

export async function signOutUser() {
  await withAuth(async ({ signOut }, auth) => {
    await signOut(auth);
  });
}