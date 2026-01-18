import "server-only";
import admin from "firebase-admin";
import { isEmulated } from './environment';

type FirebaseAdminAppParams = {
  projectId: string;
  clientEmail: string;
  storageBucket: string;
  privateKey: string;
}

// IMPORTANT: set emulator env vars BEFORE initializeApp()
// This has to be done because we are running within NextJS rather than Firebase Functions
if (isEmulated) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||= 'localhost:9097';
  process.env.FIRESTORE_EMULATOR_HOST ||= 'localhost:8087';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= 'localhost:9197';
}

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

// Singleton pattern to ensure the app is initialized only once
let firebaseAdminApp: admin.app.App | null = null;

function initializeFirebaseAdminApp(params: FirebaseAdminAppParams) {
  const privateKey = formatPrivateKey(params.privateKey);

  if (!firebaseAdminApp) {
    const cert = admin.credential.cert({
      projectId: params.projectId,
      clientEmail: params.clientEmail,
      privateKey,
    });

    // if already initialized, use that one
    if (admin.apps.length > 0) {
      firebaseAdminApp = admin.app();
      return firebaseAdminApp;
    }

    firebaseAdminApp = admin.initializeApp({
      credential: cert,
      projectId: params.projectId,
      storageBucket: params.storageBucket,
    });
  }

  return firebaseAdminApp;
}

// Initialize Firebase Admin app with environment variables
function initAdmin() {
  const params = {
    projectId: "relicry-prod",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string || '',
    storageBucket: "relicry-prod.firebasestorage.app",
    privateKey: process.env.FIREBASE_PRIVATE_KEY as string || '',
  };

  return initializeFirebaseAdminApp(params);
}

// Export the initialized app and Firebase services
const appAdmin = initAdmin();
const firestoreAdmin = appAdmin.firestore();
const storageAdmin = appAdmin.storage();

export { appAdmin, firestoreAdmin, storageAdmin };
