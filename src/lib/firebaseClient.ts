import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDaRuilDPila7nQkRtZs5cihjsH4oT6mr4",
  authDomain: "relicry-prod.firebaseapp.com",
  projectId: "relicry-prod",
  storageBucket: "relicry-prod.firebasestorage.app",
  messagingSenderId: "163360987560",
  appId: "1:163360987560:web:22a62158be30b689fce59d",
  measurementId: "G-8G7QQBZL3W"
};

const appClient = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const authClient = getAuth(appClient);
const firestoreClient = getFirestore(appClient);
const functionsClient = getFunctions(appClient);
const storageClient = getStorage(appClient);
const googleProvider = new GoogleAuthProvider();

// Use emulators if the environment variable is set
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(authClient, 'http://localhost:9097');
  connectFirestoreEmulator(firestoreClient, 'localhost', 8087);
  connectFunctionsEmulator(functionsClient, 'localhost', 5007);
  connectStorageEmulator(storageClient, 'localhost', 9197);
}

export {
  appClient,
  authClient,
  firestoreClient,
  functionsClient,
  storageClient,
  googleProvider,
};
