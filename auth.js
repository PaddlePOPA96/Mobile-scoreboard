import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  getAuth,
  initializeAuth,
} from "firebase/auth";
import { getReactNativePersistence } from "@firebase/auth/dist/rn/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from "./firebase";

let authInstance;

try {
  // Inisialisasi Auth dengan persistence AsyncStorage (React Native)
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Jika sudah pernah di‑init (mis. karena Fast Refresh), pakai instance yang ada
  authInstance = getAuth(app);
}

export const auth = authInstance;

export {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
};
