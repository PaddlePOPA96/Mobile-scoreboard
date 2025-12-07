import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  getAuth,
} from "firebase/auth";
import { app } from "./firebase";

// Simple Auth instance for Expo / React Native.
// Uses default (in-memory) persistence, which is enough for builds.
export const auth = getAuth(app);

export {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
};
