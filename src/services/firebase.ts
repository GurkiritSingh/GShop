import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  type User,
} from 'firebase/auth';
import {
  getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import type { ShoppingItem, DietaryTag, WeeklyMealPlan, Meal } from '../types';

// ===== Firebase Config =====
// REPLACE these with your Firebase project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { isConfigured };

// ===== Auth =====
export async function signUp(email: string, password: string) {
  if (!auth) throw new Error('Firebase not configured');
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function logIn(email: string, password: string) {
  if (!auth) throw new Error('Firebase not configured');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logInWithGoogle() {
  if (!auth) throw new Error('Firebase not configured');
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function logOutUser() {
  if (!auth) throw new Error('Firebase not configured');
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth?.currentUser ?? null;
}

// ===== Cloud Sync =====
interface UserCloudData {
  shoppingList: ShoppingItem[];
  dietaryFilters: DietaryTag[];
  mealPlan: WeeklyMealPlan;
  savedMeals: Meal[];
  weeklyBudget: number;
  updatedAt: unknown;
}

export async function saveToCloud(userId: string, data: Partial<UserCloudData>) {
  if (!db) return;
  const ref = doc(db, 'users', userId);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function loadFromCloud(userId: string): Promise<Partial<UserCloudData> | null> {
  if (!db) return null;
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Partial<UserCloudData>) : null;
}

export function onCloudDataChange(
  userId: string,
  callback: (data: Partial<UserCloudData> | null) => void
) {
  if (!db) return () => {};
  const ref = doc(db, 'users', userId);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as Partial<UserCloudData>) : null);
  });
}
