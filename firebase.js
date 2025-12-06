import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { firebaseConfig } from "shared/firebaseConfig";

// Expo / React Native Firebase app, shared config with Next.js.

if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Firebase-Mobile] Environment variables belum lengkap. Pastikan EXPO_PUBLIC_FIREBASE_* sudah di-set.",
  );
}

export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getDatabase(app);
