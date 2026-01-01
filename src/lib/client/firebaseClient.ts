// @NOTE: By only importing types from 'firebase/*', we only import Typescript
// types here, not the actual firebase code. This keeps bundle size down so we
// can do lazy initialization of the actual firebase code later.
import type { FirebaseApp } from 'firebase/app';
import type { Auth, GoogleAuthProvider } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { Functions } from 'firebase/functions';
import type { FirebaseStorage } from 'firebase/storage';
import { isEmulated } from '../environment';

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
};

function getClientConfig(): FirebaseClientConfig {
  // Keep this module tiny: no firebase imports here.
  return {
    apiKey: "AIzaSyDaRuilDPila7nQkRtZs5cihjsH4oT6mr4",
    authDomain: "relicry-prod.firebaseapp.com",
    projectId: "relicry-prod",
    storageBucket: "relicry-prod.firebasestorage.app",
    messagingSenderId: "163360987560",
    appId: "1:163360987560:web:22a62158be30b689fce59d",
    measurementId: "G-8G7QQBZL3W",
  };
}

// ---- Internal cached promises/instances ----
let appP: Promise<FirebaseApp> | null = null;
let authP: Promise<Auth> | null = null;
let dbP: Promise<Firestore> | null = null;
let functionsP: Promise<Functions> | null = null;
let storageP: Promise<FirebaseStorage> | null = null;
let googleProviderP: Promise<GoogleAuthProvider> | null = null;

// ---- App ----
export function getFirebaseApp(): Promise<FirebaseApp> {
  if (appP) return appP;

  appP = (async () => {
    const { initializeApp, getApp, getApps } = await import('firebase/app');
    const config = getClientConfig();
    return getApps().length ? getApp() : initializeApp(config);
  })();

  return appP;
}

/**
 * Example usage: see ./signInClient.ts
 */
export function getAuthClient(): Promise<Auth> {
  if (authP) return authP;

  authP = (async () => {
    const [{ getAuth, connectAuthEmulator }, app] = await Promise.all([
      import('firebase/auth'),
      getFirebaseApp(),
    ]);
    const client = getAuth(app);
    if (isEmulated) {
      connectAuthEmulator(client, 'http://localhost:9097');
    }
    return client;
  })();

  return authP;
}

/**
 * Example usage:
  (async () => {
    const [{ doc, getDoc }, db] = await Promise.all([
      import('firebase/firestore'),
      getFirestoreClient(),
    ]);
    const ref = doc(db, 'users', uid, 'collection', cardId);
    const snap = await getDoc(ref);
    if (!cancelled) {
      // setOwned(snap.exists())
    }
  })();
 */
export function getFirestoreClient(): Promise<Firestore> {
  if (dbP) return dbP;

  dbP = (async () => {
    const [{ getFirestore, connectFirestoreEmulator }, app] = await Promise.all([
      import('firebase/firestore'),
      getFirebaseApp(),
    ]);
    const client = getFirestore(app);
    if (isEmulated) {
      connectFirestoreEmulator(client, 'localhost', 8087);
    }
    return client;
  })();

  return dbP;
}

/**
 * Example usage:
  'use client';

  import { getFunctionsClient } from '@/lib/firebase/clientServices';

  export async function callSomeFunction() {
    const [{ httpsCallable }, functions] = await Promise.all([
      import('firebase/functions'),
      getFunctionsClient('us-central1'),
    ]);

    const fn = httpsCallable(functions, 'doThing');
    return fn({ hello: 'world' });
  }
 */
export function getFunctionsClient(region?: string): Promise<Functions> {
  // If you use multiple regions, cache per-region instead.
  if (functionsP) return functionsP;

  functionsP = (async () => {
    const [{ getFunctions, connectFunctionsEmulator }, app] = await Promise.all([
      import('firebase/functions'),
      getFirebaseApp(),
    ]);
    const client = getFunctions(app, region);
    if (isEmulated) {
      connectFunctionsEmulator(client, 'localhost', 5007);
    }
    return client;
  })();

  return functionsP;
}

/**
 * Example usage:
    'use client';

    import { getStorageClient } from '@/lib/firebase/clientServices';

    export async function uploadFile(path: string, file: File) {
      const [{ ref, uploadBytes }, storage] = await Promise.all([
        import('firebase/storage'),
        getStorageClient(),
      ]);

      const r = ref(storage, path);
      await uploadBytes(r, file);
    }
 */
export function getStorageClient(): Promise<FirebaseStorage> {
  if (storageP) return storageP;

  storageP = (async () => {
    const [{ getStorage, connectStorageEmulator }, app] = await Promise.all([
      import('firebase/storage'),
      getFirebaseApp(),
    ]);
    const client = getStorage(app);
    if (isEmulated) {
      connectStorageEmulator(client, 'localhost', 9197);
    }
    return client;
  })();

  return storageP;
}

// ---- Auth Providers (Google) ----
export function getGoogleAuthProvider(): Promise<GoogleAuthProvider> {
  if (googleProviderP) return googleProviderP;

  googleProviderP = (async () => {
    const { GoogleAuthProvider } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    // Optional: add scopes / custom parameters here
    // provider.addScope('email');
    // provider.setCustomParameters({ prompt: 'select_account' });
    return provider;
  })();

  return googleProviderP;
}
