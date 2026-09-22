import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { 
  getStorage
} from 'firebase/storage';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: firebaseConfigJson.projectId,
  appId: firebaseConfigJson.appId,
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
};

// Initialize Firebase App singleton
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Services
export const auth = getAuth(firebaseApp);

// Initialize Firestore singleton matching SKILL.md specification
export const db = getFirestore(firebaseApp, firebaseConfigJson.firestoreDatabaseId);
export const storage = getStorage(firebaseApp);

// Test and validate connection to Firestore on initialization
async function testConnection() {
  try {
    const testDocRef = doc(db, 'test', 'connection');
    const snap = await getDoc(testDocRef);
    if (!snap.exists()) {
      await setDoc(testDocRef, {
        status: 'online',
        databaseId: firebaseConfigJson.firestoreDatabaseId,
        initializedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    // Non-blocking background connectivity ping
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('unavailable'))) {
      // Offline fallback is active
    }
  }
}

if (typeof window !== 'undefined') {
  setTimeout(() => {
    testConnection().catch(() => {});
  }, 1000);
}

// Enable browser local persistence with graceful fallback for iframe sandboxes
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    setPersistence(auth, inMemoryPersistence).catch(() => {});
  });
}

