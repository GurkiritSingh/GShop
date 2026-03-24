import type { ShoppingItem, DietaryTag, WeeklyMealPlan, Meal } from '../types';
import { DAYS } from '../types';

// ===== Shopping List Sharing =====

interface SharedListData {
  t: 'list';
  name: string;
  items: { n: string; q: number; c: string }[];
  d: string[];
}

export function encodeListToUrl(name: string, items: ShoppingItem[], dietary: DietaryTag[]): string {
  const data: SharedListData = {
    t: 'list',
    name,
    items: items.map(i => ({ n: i.name, q: i.quantity, c: i.category })),
    d: dietary,
  };
  const json = JSON.stringify(data);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return `${window.location.origin}${window.location.pathname}?share=${encoded}`;
}

// ===== Meal Plan Sharing =====

interface SharedMealPlanData {
  t: 'mealplan';
  name: string;
  plan: Record<string, { mealId: string; slot: string }[]>;
  meals: { id: string; name: string; servings: number; tags: string[]; ingredients: { n: string; q: number; c: string }[] }[];
  d: string[];
}

export function encodeMealPlanToUrl(
  name: string,
  plan: WeeklyMealPlan,
  meals: Meal[],
  dietary: DietaryTag[]
): string {
  // Collect only meals that are actually used in the plan
  const usedMealIds = new Set<string>();
  for (const day of DAYS) {
    for (const entry of plan[day]) {
      usedMealIds.add(entry.mealId);
    }
  }

  const usedMeals = meals.filter(m => usedMealIds.has(m.id));

  const data: SharedMealPlanData = {
    t: 'mealplan',
    name,
    plan: Object.fromEntries(DAYS.map(d => [d, plan[d]])),
    meals: usedMeals.map(m => ({
      id: m.id,
      name: m.name,
      servings: m.servings,
      tags: m.tags,
      ingredients: m.ingredients.map(i => ({ n: i.name, q: i.quantity, c: i.category })),
    })),
    d: dietary,
  };

  const json = JSON.stringify(data);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return `${window.location.origin}${window.location.pathname}?share=${encoded}`;
}

// ===== Single Meal Sharing =====

interface SharedMealData {
  t: 'meal';
  name: string;
  servings: number;
  tags: string[];
  ingredients: { n: string; q: number; c: string }[];
}

export function encodeMealToUrl(meal: Meal): string {
  const data: SharedMealData = {
    t: 'meal',
    name: meal.name,
    servings: meal.servings,
    tags: meal.tags,
    ingredients: meal.ingredients.map(i => ({ n: i.name, q: i.quantity, c: i.category })),
  };
  const json = JSON.stringify(data);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return `${window.location.origin}${window.location.pathname}?share=${encoded}`;
}

// ===== Decoding =====

export type SharedData =
  | { type: 'list'; name: string; items: ShoppingItem[]; dietary: DietaryTag[] }
  | { type: 'mealplan'; name: string; plan: WeeklyMealPlan; meals: Meal[]; dietary: DietaryTag[] }
  | { type: 'meal'; meal: Meal };

export function decodeFromUrl(url: string): SharedData | null {
  try {
    const params = new URL(url).searchParams;
    const encoded = params.get('share') || params.get('list'); // backwards compat
    if (!encoded) return null;

    const json = decodeURIComponent(escape(atob(encoded)));
    const raw = JSON.parse(json);

    if (raw.t === 'mealplan') {
      const d = raw as SharedMealPlanData;
      const meals: Meal[] = d.meals.map(m => ({
        id: m.id,
        name: m.name,
        servings: m.servings,
        tags: m.tags as DietaryTag[],
        ingredients: m.ingredients.map(i => ({
          name: i.n, quantity: i.q, category: i.c as ShoppingItem['category'],
        })),
      }));

      const plan = {} as WeeklyMealPlan;
      for (const day of DAYS) {
        plan[day] = (d.plan[day] || []).map(e => ({
          mealId: e.mealId,
          slot: e.slot as 'breakfast' | 'lunch' | 'dinner',
        }));
      }

      return { type: 'mealplan', name: d.name, plan, meals, dietary: (d.d || []) as DietaryTag[] };
    }

    if (raw.t === 'meal') {
      const d = raw as SharedMealData;
      const meal: Meal = {
        id: `shared-${Date.now()}`,
        name: d.name,
        servings: d.servings,
        tags: d.tags as DietaryTag[],
        ingredients: d.ingredients.map(i => ({
          name: i.n, quantity: i.q, category: i.c as ShoppingItem['category'],
        })),
      };
      return { type: 'meal', meal };
    }

    // Default: shopping list (raw.t === 'list' or old format without t)
    const d = raw as SharedListData;
    const items: ShoppingItem[] = d.items.map(i => ({
      id: crypto.randomUUID(),
      name: i.n,
      quantity: i.q,
      category: i.c as ShoppingItem['category'],
      dietaryPrefs: [],
    }));

    return { type: 'list', name: d.name, items, dietary: (d.d || []) as DietaryTag[] };
  } catch {
    return null;
  }
}

export function decodeFromCurrentUrl(): SharedData | null {
  return decodeFromUrl(window.location.href);
}
