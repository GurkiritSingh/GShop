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
const firebaseConfig = {
  apiKey: "AIzaSyDMcTI9Md-M37wPUoWuMkWyhuicYnd1Yv4",
  authDomain: "gshop-9acd8.firebaseapp.com",
  projectId: "gshop-9acd8",
  storageBucket: "gshop-9acd8.firebasestorage.app",
  messagingSenderId: "60945868835",
  appId: "1:60945868835:web:20d0815a917a1624a26996",
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
