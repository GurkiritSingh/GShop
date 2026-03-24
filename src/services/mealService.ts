import type { Meal, WeeklyMealPlan, MealIngredient, DietaryTag } from '../types';
import { DAYS } from '../types';

const SAVED_MEALS_KEY = 'gshop-saved-meals';
const MEAL_PLAN_KEY = 'gshop-meal-plan';

// ===== Pre-built meals =====
export const PRESET_MEALS: Meal[] = [
  {
    id: 'preset-spag-bol',
    name: 'Spaghetti Bolognese',
    servings: 4,
    tags: ['dairy_free', 'nut_free'],
    ingredients: [
      { name: 'spaghetti pasta', quantity: 1, category: 'other' },
      { name: 'mince beef', quantity: 1, category: 'meat_fish' },
      { name: 'chopped tomatoes', quantity: 2, category: 'tinned' },
      { name: 'onions', quantity: 1, category: 'fruit_veg' },
      { name: 'garlic', quantity: 1, category: 'fruit_veg' },
      { name: 'olive oil', quantity: 1, category: 'other' },
    ],
  },
  {
    id: 'preset-chicken-stir-fry',
    name: 'Chicken Stir Fry',
    servings: 4,
    tags: ['dairy_free', 'nut_free'],
    ingredients: [
      { name: 'chicken breast', quantity: 1, category: 'meat_fish' },
      { name: 'peppers', quantity: 1, category: 'fruit_veg' },
      { name: 'noodles', quantity: 1, category: 'other' },
      { name: 'soy sauce', quantity: 1, category: 'other' },
      { name: 'ginger', quantity: 1, category: 'fruit_veg' },
      { name: 'spring onions', quantity: 1, category: 'fruit_veg' },
    ],
  },
  {
    id: 'preset-beans-on-toast',
    name: 'Beans on Toast',
    servings: 2,
    tags: ['vegan', 'vegetarian', 'dairy_free', 'nut_free', 'halal'],
    ingredients: [
      { name: 'baked beans', quantity: 1, category: 'tinned' },
      { name: 'bread', quantity: 1, category: 'bakery' },
    ],
  },
  {
    id: 'preset-fish-and-chips',
    name: 'Fish & Chips',
    servings: 4,
    tags: ['dairy_free', 'nut_free', 'halal'],
    ingredients: [
      { name: 'cod', quantity: 1, category: 'meat_fish' },
      { name: 'chips', quantity: 1, category: 'frozen' },
      { name: 'frozen peas', quantity: 1, category: 'frozen' },
      { name: 'lemons', quantity: 1, category: 'fruit_veg' },
    ],
  },
  {
    id: 'preset-chilli-con-carne',
    name: 'Chilli Con Carne',
    servings: 4,
    tags: ['gluten_free', 'dairy_free', 'nut_free'],
    ingredients: [
      { name: 'mince beef', quantity: 1, category: 'meat_fish' },
      { name: 'kidney beans', quantity: 1, category: 'tinned' },
      { name: 'chopped tomatoes', quantity: 2, category: 'tinned' },
      { name: 'onions', quantity: 1, category: 'fruit_veg' },
      { name: 'rice', quantity: 1, category: 'other' },
      { name: 'chilli powder', quantity: 1, category: 'other' },
    ],
  },
  {
    id: 'preset-jacket-potato',
    name: 'Jacket Potato & Beans',
    servings: 2,
    tags: ['vegetarian', 'nut_free', 'halal'],
    ingredients: [
      { name: 'potatoes', quantity: 1, category: 'fruit_veg' },
      { name: 'baked beans', quantity: 1, category: 'tinned' },
      { name: 'cheese', quantity: 1, category: 'dairy' },
      { name: 'butter', quantity: 1, category: 'dairy' },
    ],
  },
  {
    id: 'preset-vegan-curry',
    name: 'Chickpea Curry',
    servings: 4,
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'nut_free', 'halal', 'kosher'],
    ingredients: [
      { name: 'chickpeas', quantity: 2, category: 'tinned' },
      { name: 'chopped tomatoes', quantity: 1, category: 'tinned' },
      { name: 'coconut milk', quantity: 1, category: 'tinned' },
      { name: 'onions', quantity: 1, category: 'fruit_veg' },
      { name: 'garlic', quantity: 1, category: 'fruit_veg' },
      { name: 'curry paste', quantity: 1, category: 'other' },
      { name: 'rice', quantity: 1, category: 'other' },
      { name: 'spinach', quantity: 1, category: 'fruit_veg' },
    ],
  },
  {
    id: 'preset-omelette',
    name: 'Cheese Omelette',
    servings: 2,
    tags: ['vegetarian', 'gluten_free', 'nut_free', 'halal'],
    ingredients: [
      { name: 'eggs', quantity: 1, category: 'dairy' },
      { name: 'cheese', quantity: 1, category: 'dairy' },
      { name: 'peppers', quantity: 1, category: 'fruit_veg' },
      { name: 'mushrooms', quantity: 1, category: 'fruit_veg' },
      { name: 'butter', quantity: 1, category: 'dairy' },
    ],
  },
  {
    id: 'preset-salmon-veg',
    name: 'Salmon & Roast Veg',
    servings: 2,
    tags: ['gluten_free', 'dairy_free', 'nut_free', 'halal'],
    ingredients: [
      { name: 'salmon', quantity: 1, category: 'meat_fish' },
      { name: 'broccoli', quantity: 1, category: 'fruit_veg' },
      { name: 'sweet potatoes', quantity: 1, category: 'fruit_veg' },
      { name: 'olive oil', quantity: 1, category: 'other' },
      { name: 'lemons', quantity: 1, category: 'fruit_veg' },
    ],
  },
  {
    id: 'preset-pasta-bake',
    name: 'Pasta Bake',
    servings: 4,
    tags: ['vegetarian', 'nut_free', 'halal'],
    ingredients: [
      { name: 'pasta', quantity: 1, category: 'other' },
      { name: 'pasta sauce', quantity: 1, category: 'other' },
      { name: 'cheese', quantity: 1, category: 'dairy' },
      { name: 'mushrooms', quantity: 1, category: 'fruit_veg' },
      { name: 'peppers', quantity: 1, category: 'fruit_veg' },
    ],
  },
  {
    id: 'preset-full-english',
    name: 'Full English Breakfast',
    servings: 2,
    tags: ['nut_free'],
    ingredients: [
      { name: 'bacon', quantity: 1, category: 'meat_fish' },
      { name: 'sausages', quantity: 1, category: 'meat_fish' },
      { name: 'eggs', quantity: 1, category: 'dairy' },
      { name: 'baked beans', quantity: 1, category: 'tinned' },
      { name: 'bread', quantity: 1, category: 'bakery' },
      { name: 'mushrooms', quantity: 1, category: 'fruit_veg' },
      { name: 'tomatoes', quantity: 1, category: 'fruit_veg' },
    ],
  },
  {
    id: 'preset-porridge',
    name: 'Porridge with Fruit',
    servings: 2,
    tags: ['vegetarian', 'nut_free', 'halal'],
    ingredients: [
      { name: 'porridge oats', quantity: 1, category: 'other' },
      { name: 'milk', quantity: 1, category: 'dairy' },
      { name: 'bananas', quantity: 1, category: 'fruit_veg' },
      { name: 'honey', quantity: 1, category: 'other' },
      { name: 'blueberries', quantity: 1, category: 'fruit_veg' },
    ],
  },
  {
    id: 'preset-sunday-roast',
    name: 'Sunday Roast Chicken',
    servings: 4,
    tags: ['nut_free'],
    ingredients: [
      { name: 'whole chicken', quantity: 1, category: 'meat_fish' },
      { name: 'potatoes', quantity: 1, category: 'fruit_veg' },
      { name: 'carrots', quantity: 1, category: 'fruit_veg' },
      { name: 'broccoli', quantity: 1, category: 'fruit_veg' },
      { name: 'gravy granules', quantity: 1, category: 'other' },
      { name: 'yorkshire puddings', quantity: 1, category: 'frozen' },
    ],
  },
  {
    id: 'preset-veg-fajitas',
    name: 'Veggie Fajitas',
    servings: 4,
    tags: ['vegan', 'vegetarian', 'dairy_free', 'nut_free', 'halal'],
    ingredients: [
      { name: 'peppers', quantity: 1, category: 'fruit_veg' },
      { name: 'onions', quantity: 1, category: 'fruit_veg' },
      { name: 'mushrooms', quantity: 1, category: 'fruit_veg' },
      { name: 'wraps', quantity: 1, category: 'bakery' },
      { name: 'kidney beans', quantity: 1, category: 'tinned' },
      { name: 'rice', quantity: 1, category: 'other' },
    ],
  },
];

// ===== localStorage helpers =====
export function loadSavedMeals(): Meal[] {
  try {
    const data = localStorage.getItem(SAVED_MEALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveMeals(meals: Meal[]) {
  localStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(meals));
}

export function loadMealPlan(): WeeklyMealPlan {
  try {
    const data = localStorage.getItem(MEAL_PLAN_KEY);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  return emptyMealPlan();
}

export function saveMealPlan(plan: WeeklyMealPlan) {
  localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));
}

export function emptyMealPlan(): WeeklyMealPlan {
  const plan = {} as WeeklyMealPlan;
  for (const day of DAYS) plan[day] = [];
  return plan;
}

export function getAllMeals(saved: Meal[]): Meal[] {
  const ids = new Set(saved.map(m => m.id));
  return [...saved, ...PRESET_MEALS.filter(m => !ids.has(m.id))];
}

export function getMealById(id: string, saved: Meal[]): Meal | undefined {
  return saved.find(m => m.id === id) || PRESET_MEALS.find(m => m.id === id);
}

export function mealPlanIngredients(plan: WeeklyMealPlan, saved: Meal[]): MealIngredient[] {
  const combined: Record<string, MealIngredient> = {};

  for (const day of DAYS) {
    for (const entry of plan[day]) {
      const meal = getMealById(entry.mealId, saved);
      if (!meal) continue;
      for (const ing of meal.ingredients) {
        const key = ing.name.toLowerCase();
        if (combined[key]) {
          combined[key].quantity += ing.quantity;
        } else {
          combined[key] = { ...ing };
        }
      }
    }
  }

  return Object.values(combined);
}

export function filterMealsByDietary(meals: Meal[], tags: DietaryTag[]): Meal[] {
  if (tags.length === 0) return meals;
  return meals.filter(meal => tags.every(tag => meal.tags.includes(tag)));
}
