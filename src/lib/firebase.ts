import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { enableIndexedDbPersistence } from 'firebase/firestore';

/**
 * Firebase Configuration for Byte-Sized Learning
 * 
 * Environment variables required (from .env file):
 * VITE_FIREBASE_API_KEY
 * VITE_FIREBASE_AUTH_DOMAIN
 * VITE_FIREBASE_PROJECT_ID
 * VITE_FIREBASE_STORAGE_BUCKET
 * VITE_FIREBASE_MESSAGING_SENDER_ID
 * VITE_FIREBASE_APP_ID
 * VITE_FIREBASE_MEASUREMENT_ID (optional)
 * 
 * All environment variables are loaded automatically from the .env file.
 */

// Load Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

/**
 * Validate Firebase configuration
 * Ensures all required environment variables are present
 */
const validateFirebaseConfig = (): void => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

  if (missingKeys.length > 0) {
    const missingEnvVars = missingKeys.map(key => {
      // Convert camelCase to SCREAMING_SNAKE_CASE
      const snakeCase = key.replace(/([A-Z])/g, '_$1').toUpperCase();
      return `VITE_FIREBASE_${snakeCase}`;
    });

    const errorMessage = `
      ❌ Firebase Configuration Error
      Missing environment variables in .env file:
      ${missingEnvVars.map(v => `  - ${v}`).join('\n')}
      
      Please ensure your .env file contains all required Firebase credentials.
      See .env.example or documentation for details.
    `;
    throw new Error(errorMessage);
  }

  console.log('✅ Firebase configuration loaded successfully');
  console.log('📍 Project ID:', firebaseConfig.projectId);
};

// Validate before initializing
validateFirebaseConfig();

// Initialize Firebase App
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  throw error;
}

// Initialize Firebase Services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

console.log('✅ Firebase services initialized:');
console.log('   - Authentication');
console.log('   - Firestore Database');
console.log('   - Cloud Storage');

/**
 * Enable offline persistence for Firestore
 * Allows app to work offline and sync when connection is restored
 */
enableIndexedDbPersistence(firestore)
  .then(() => {
    console.log('✅ Firestore offline persistence enabled');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Firestore persistence: Multiple tabs open - persistence disabled');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Firestore persistence not supported in this browser');
    } else {
      console.warn('⚠️ Firestore persistence error:', err.message);
    }
  });

export default app;
