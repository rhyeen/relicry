import "server-only";
import admin from "firebase-admin";
import { isEmulated } from './environment';

const FIREBASE_PROJECT_ID = 'relicry-prod';
const FIREBASE_STORAGE_BUCKET = 'relicry-prod.firebasestorage.app';

type FirebaseAdminAppParams = {
  projectId: string;
  clientEmail: string;
  storageBucket: string;
  privateKey: string;
}

function ensureEmulatorEnv() {
  // IMPORTANT: set emulator env vars BEFORE initializeApp()
  // This has to be done because we are running within NextJS rather than Firebase Functions
  if (isEmulated) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||= 'localhost:9097';
    process.env.FIRESTORE_EMULATOR_HOST ||= 'localhost:8087';
    process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= 'localhost:9197';
  }
}

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

function hasEnvValue(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getFirebaseAdminAppParams(): FirebaseAdminAppParams {
  const clientEmail = process.env.RC_FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.RC_FIREBASE_PRIVATE_KEY;
  const missing: string[] = [];

  if (!hasEnvValue(clientEmail)) {
    missing.push('RC_FIREBASE_CLIENT_EMAIL');
  }

  if (!hasEnvValue(privateKey)) {
    missing.push('RC_FIREBASE_PRIVATE_KEY');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase Admin environment variable${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}. ` +
      'If this is happening during deploy, make sure Firebase-backed pages render at request time rather than during the Next.js build.'
    );
  }

  return {
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: (clientEmail || '').trim(),
    storageBucket: FIREBASE_STORAGE_BUCKET,
    privateKey: (privateKey || '').trim(),
  };
}

// Singleton pattern to ensure the app is initialized only once
let firebaseAdminApp: admin.app.App | null = null;

function initializeFirebaseAdminApp(params: FirebaseAdminAppParams) {
  if (!firebaseAdminApp) {
    ensureEmulatorEnv();

    // if already initialized, use that one
    if (admin.apps.length > 0) {
      firebaseAdminApp = admin.app();
      return firebaseAdminApp;
    }

    const appOptions: admin.AppOptions = {
      projectId: params.projectId,
      storageBucket: params.storageBucket,
    };

    if (!isEmulated) {
      appOptions.credential = admin.credential.cert({
        projectId: params.projectId,
        clientEmail: params.clientEmail,
        privateKey: formatPrivateKey(params.privateKey),
      });
    }

    firebaseAdminApp = admin.initializeApp(appOptions);
  }

  return firebaseAdminApp;
}

// Initialize Firebase Admin app with environment variables
function initAdmin() {
  if (isEmulated) {
    return initializeFirebaseAdminApp({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: '',
      storageBucket: FIREBASE_STORAGE_BUCKET,
      privateKey: '',
    });
  }

  return initializeFirebaseAdminApp(getFirebaseAdminAppParams());
}

export function getAppAdmin(): admin.app.App {
  if (!firebaseAdminApp) {
    initAdmin();
  }
  return firebaseAdminApp!;
}

export function getFirestoreAdmin(): FirebaseFirestore.Firestore {
  return getAppAdmin().firestore();
}

export function getStorageAdmin(): admin.storage.Storage {
  return getAppAdmin().storage();
}
