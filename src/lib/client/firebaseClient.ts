"use client";

/**
  Firebase client helpers optimized for small initial bundles:

  - No static imports from `firebase/*` (only type imports).
  - Dynamic imports are cached (module chunks load once).
  - Clients are lazy-initialized and cached (Auth/Firestore/Functions/Storage).
  - Optional `withAuth/withFirestore/withFunctions/withStorage` helpers keep call sites clean.
  - Emulator connections are guarded to avoid HMR double-connect errors.
 */
import type { FirebaseApp } from "firebase/app";
import type { Auth, GoogleAuthProvider } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { Functions } from "firebase/functions";
import type { FirebaseStorage } from "firebase/storage";
import { isEmulated } from "../environment";

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

// ------------------------------
// Lazy-loaded Firebase modules (cached)
// ------------------------------
let appModP: Promise<typeof import("firebase/app")> | null = null;
let authModP: Promise<typeof import("firebase/auth")> | null = null;
let fsModP: Promise<typeof import("firebase/firestore")> | null = null;
let fnModP: Promise<typeof import("firebase/functions")> | null = null;
let stModP: Promise<typeof import("firebase/storage")> | null = null;

function appMod() {
  appModP ??= import("firebase/app");
  return appModP;
}
function authMod() {
  authModP ??= import("firebase/auth");
  return authModP;
}
function fsMod() {
  fsModP ??= import("firebase/firestore");
  return fsModP;
}
function fnMod() {
  fnModP ??= import("firebase/functions");
  return fnModP;
}
function stMod() {
  stModP ??= import("firebase/storage");
  return stModP;
}

// ------------------------------
// Internal cached promises/instances
// ------------------------------
let appP: Promise<FirebaseApp> | null = null;
let authP: Promise<Auth> | null = null;
let dbP: Promise<Firestore> | null = null;
let functionsP: Promise<Functions> | null = null;
let storageP: Promise<FirebaseStorage> | null = null;
let googleProviderP: Promise<GoogleAuthProvider> | null = null;

// ------------------------------
// App
// ------------------------------
export function getFirebaseApp(): Promise<FirebaseApp> {
  if (appP) return appP;

  appP = (async () => {
    const { initializeApp, getApp, getApps } = await appMod();
    const config = getClientConfig();
    return getApps().length ? getApp() : initializeApp(config);
  })();

  return appP;
}

// ------------------------------
// Auth
// ------------------------------
export function getAuthClient(): Promise<Auth> {
  if (authP) return authP;

  authP = (async () => {
    const [{ getAuth, connectAuthEmulator }, app] = await Promise.all([
      authMod(),
      getFirebaseApp(),
    ]);

    const client = getAuth(app);

    if (isEmulated) {
      // Guard for HMR: connectAuthEmulator throws if called twice.
      const g = globalThis as unknown as { __AUTH_EMU__?: boolean };
      if (!g.__AUTH_EMU__) {
        connectAuthEmulator(client, "http://localhost:9097");
        g.__AUTH_EMU__ = true;
      }
    }

    return client;
  })();

  return authP;
}

// ------------------------------
// Firestore
// ------------------------------
export function getFirestoreClient(): Promise<Firestore> {
  if (dbP) return dbP;

  dbP = (async () => {
    const [{ getFirestore, connectFirestoreEmulator }, app] = await Promise.all([
      fsMod(),
      getFirebaseApp(),
    ]);

    const client = getFirestore(app);

    if (isEmulated) {
      // Guard for HMR
      const g = globalThis as unknown as { __FIRESTORE_EMU__?: boolean };
      if (!g.__FIRESTORE_EMU__) {
        connectFirestoreEmulator(client, "localhost", 8087);
        g.__FIRESTORE_EMU__ = true;
      }
    }

    return client;
  })();

  return dbP;
}

// ------------------------------
// Functions
// ------------------------------
export function getFunctionsClient(region?: string): Promise<Functions> {
  // If you use multiple regions, cache per-region instead.
  if (functionsP) return functionsP;

  functionsP = (async () => {
    const [{ getFunctions, connectFunctionsEmulator }, app] = await Promise.all([
      fnMod(),
      getFirebaseApp(),
    ]);

    const client = getFunctions(app, region);

    if (isEmulated) {
      const g = globalThis as unknown as { __FUNCTIONS_EMU__?: boolean };
      if (!g.__FUNCTIONS_EMU__) {
        connectFunctionsEmulator(client, "localhost", 5007);
        g.__FUNCTIONS_EMU__ = true;
      }
    }

    return client;
  })();

  return functionsP;
}

// ------------------------------
// Storage
// ------------------------------
export function getStorageClient(): Promise<FirebaseStorage> {
  if (storageP) return storageP;

  storageP = (async () => {
    const [{ getStorage, connectStorageEmulator }, app] = await Promise.all([
      stMod(),
      getFirebaseApp(),
    ]);

    const client = getStorage(app);

    if (isEmulated) {
      const g = globalThis as unknown as { __STORAGE_EMU__?: boolean };
      if (!g.__STORAGE_EMU__) {
        connectStorageEmulator(client, "localhost", 9197);
        g.__STORAGE_EMU__ = true;
      }
    }

    return client;
  })();

  return storageP;
}

// ------------------------------
// Auth Providers (Google)
// ------------------------------
export function getGoogleAuthProvider(): Promise<GoogleAuthProvider> {
  if (googleProviderP) return googleProviderP;

  googleProviderP = (async () => {
    const { GoogleAuthProvider } = await authMod();
    const provider = new GoogleAuthProvider();
    // Optional: provider.addScope('email'); provider.setCustomParameters({ prompt: 'select_account' });
    return provider;
  })();

  return googleProviderP;
}

// ------------------------------
// "withX" wrappers (ergonomic + keeps dynamic imports centralized)
// ------------------------------
export async function withAuth<T>(
  fn: (m: typeof import("firebase/auth"), auth: Auth) => Promise<T>
): Promise<T> {
  const [m, auth] = await Promise.all([authMod(), getAuthClient()]);
  return fn(m, auth);
}

export async function withFirestore<T>(
  fn: (m: typeof import("firebase/firestore"), db: Firestore) => Promise<T>
): Promise<T> {
  const [m, db] = await Promise.all([fsMod(), getFirestoreClient()]);
  return fn(m, db);
}

export async function withFunctions<T>(
  fn: (m: typeof import("firebase/functions"), fns: Functions) => Promise<T>
): Promise<T> {
  const [m, fns] = await Promise.all([fnMod(), getFunctionsClient()]);
  return fn(m, fns);
}

export async function withStorage<T>(
  fn: (m: typeof import("firebase/storage"), storage: FirebaseStorage) => Promise<T>
): Promise<T> {
  const [m, storage] = await Promise.all([stMod(), getStorageClient()]);
  return fn(m, storage);
}
