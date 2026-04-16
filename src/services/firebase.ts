// ============================================================
// GShop — Supabase Auth + Cloud Sync
// (replaces Firebase, keeps the same exported interface)
// ============================================================
import { createClient } from '@supabase/supabase-js';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { ShoppingItem, DietaryTag, WeeklyMealPlan, Meal } from '../types';

const SUPABASE_URL = 'https://qrswutkoygynhtzpxqfi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyc3d1dGtveWd5bmh0enB4cWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjQ3MTcsImV4cCI6MjA5MDEwMDcxN30.ITBPc-Qm2LlSk4asrXUfor9JFSZ95iT3AYJ6Cm-vlPY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isConfigured = true;

// ===== User type adapter =====
// AccountPanel expects a Firebase-like User shape with .email, .displayName, .photoURL, .uid
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

function toUser(su: SupabaseUser): User {
  return {
    uid: su.id,
    email: su.email ?? null,
    displayName: su.user_metadata?.display_name ?? su.user_metadata?.full_name ?? su.email?.split('@')[0] ?? null,
    photoURL: su.user_metadata?.avatar_url ?? null,
  };
}

// ===== Auth =====
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function logIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function logInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
  if (error) throw new Error(error.message);
}

export async function logOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export function onAuthChange(callback: (user: User | null) => void) {
  // Check initial session
  supabase.auth.getUser().then(({ data: { user } }) => {
    callback(user ? toUser(user) : null);
  });

  // Listen for changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? toUser(session.user) : null);
  });

  return () => subscription.unsubscribe();
}

export function getCurrentUser(): User | null {
  // Sync method — may not be available immediately
  return null;
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
  const payload: Record<string, unknown> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };
  if (data.shoppingList !== undefined) payload.shopping_list = data.shoppingList;
  if (data.dietaryFilters !== undefined) payload.dietary_filters = data.dietaryFilters;
  if (data.mealPlan !== undefined) payload.meal_plan = data.mealPlan;
  if (data.savedMeals !== undefined) payload.saved_meals = data.savedMeals;
  if (data.weeklyBudget !== undefined) payload.weekly_budget = data.weeklyBudget;

  const { error } = await supabase
    .from('gshop_user_data')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) throw new Error(error.message);
}

export async function loadFromCloud(userId: string): Promise<Partial<UserCloudData> | null> {
  const { data, error } = await supabase
    .from('gshop_user_data')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  if (!data) return null;

  return {
    shoppingList: data.shopping_list || [],
    dietaryFilters: data.dietary_filters || [],
    mealPlan: data.meal_plan || {},
    savedMeals: data.saved_meals || [],
    weeklyBudget: data.weekly_budget || 0,
  };
}

export function onCloudDataChange(
  _userId: string,
  _callback: (data: Partial<UserCloudData> | null) => void
) {
  // Supabase realtime could be added here, but manual sync is fine for now
  return () => {};
}
