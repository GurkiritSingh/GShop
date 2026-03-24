export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category: GroceryCategory;
  dietaryPrefs: DietaryTag[];
}

// ===== Dietary =====
export type DietaryTag =
  | 'vegan'
  | 'vegetarian'
  | 'gluten_free'
  | 'dairy_free'
  | 'halal'
  | 'nut_free'
  | 'kosher';

export const DIETARY_LABELS: Record<DietaryTag, { label: string; icon: string }> = {
  vegan:       { label: 'Vegan',       icon: '\uD83C\uDF31' },
  vegetarian:  { label: 'Vegetarian',  icon: '\uD83E\uDD66' },
  gluten_free: { label: 'Gluten Free', icon: '\uD83C\uDF3E' },
  dairy_free:  { label: 'Dairy Free',  icon: '\uD83E\uDD5B' },
  halal:       { label: 'Halal',       icon: '\u2714\uFE0F' },
  nut_free:    { label: 'Nut Free',    icon: '\uD83E\uDD5C' },
  kosher:      { label: 'Kosher',      icon: '\u2721\uFE0F' },
};

// ===== Meals =====
export interface MealIngredient {
  name: string;
  quantity: number;
  category: GroceryCategory;
}

export interface Meal {
  id: string;
  name: string;
  servings: number;
  tags: DietaryTag[];
  ingredients: MealIngredient[];
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

export interface MealPlanEntry {
  mealId: string;
  slot: 'breakfast' | 'lunch' | 'dinner';
}

export type WeeklyMealPlan = Record<DayOfWeek, MealPlanEntry[]>;

export type GroceryCategory =
  | 'fruit_veg'
  | 'meat_fish'
  | 'dairy'
  | 'bakery'
  | 'drinks'
  | 'snacks'
  | 'household'
  | 'frozen'
  | 'tinned'
  | 'other';

export const CATEGORY_LABELS: Record<GroceryCategory, string> = {
  fruit_veg: 'Fruit & Veg',
  meat_fish: 'Meat & Fish',
  dairy: 'Dairy',
  bakery: 'Bakery',
  drinks: 'Drinks',
  snacks: 'Snacks',
  household: 'Household',
  frozen: 'Frozen',
  tinned: 'Tinned & Canned',
  other: 'Other',
};

export type SupermarketBrand =
  | 'tesco'
  | 'asda'
  | 'sainsburys'
  | 'morrisons'
  | 'aldi'
  | 'lidl'
  | 'waitrose'
  | 'coop'
  | 'marks_spencer'
  | 'iceland'
  | 'farmfoods'
  | 'heron_foods'
  | 'spar'
  | 'costcutter'
  | 'nisa'
  | 'londis'
  | 'budgens'
  | 'home_bargains'
  | 'bm'
  | 'poundland'
  | 'ocado'
  | 'amazon_fresh'
  | 'costco';

export const SUPERMARKET_INFO: Record<SupermarketBrand, { name: string; color: string; logo: string }> = {
  tesco: { name: 'Tesco', color: '#00539F', logo: '🔵' },
  asda: { name: 'Asda', color: '#78BE20', logo: '🟢' },
  sainsburys: { name: "Sainsbury's", color: '#F06C00', logo: '🟠' },
  morrisons: { name: 'Morrisons', color: '#FFD800', logo: '🟡' },
  aldi: { name: 'Aldi', color: '#00005F', logo: '🔷' },
  lidl: { name: 'Lidl', color: '#0050AA', logo: '🟦' },
  waitrose: { name: 'Waitrose', color: '#5D8C3E', logo: '🌿' },
  coop: { name: 'Co-op', color: '#00B1EB', logo: '💙' },
  marks_spencer: { name: 'M&S', color: '#000000', logo: '⬛' },
  iceland: { name: 'Iceland', color: '#E41837', logo: '❄️' },
  farmfoods: { name: 'Farmfoods', color: '#009639', logo: '🌾' },
  heron_foods: { name: 'Heron Foods', color: '#ED1C24', logo: '🔴' },
  spar: { name: 'Spar', color: '#D52B1E', logo: '🏪' },
  costcutter: { name: 'Costcutter', color: '#FFD100', logo: '✂️' },
  nisa: { name: 'Nisa', color: '#EE3124', logo: '🏬' },
  londis: { name: 'Londis', color: '#E30613', logo: '🏠' },
  budgens: { name: 'Budgens', color: '#6CBE45', logo: '🛍️' },
  home_bargains: { name: 'Home Bargains', color: '#FDB913', logo: '🏷️' },
  bm: { name: 'B&M', color: '#FF6600', logo: '🧡' },
  poundland: { name: 'Poundland', color: '#E30613', logo: '💷' },
  ocado: { name: 'Ocado', color: '#6F2C91', logo: '📦' },
  amazon_fresh: { name: 'Amazon Fresh', color: '#FF9900', logo: '📱' },
  costco: { name: 'Costco', color: '#E31837', logo: '🏗️' },
};

export interface PriceResult {
  itemName: string;
  brand: SupermarketBrand;
  price: number;
  unitPrice?: string;
  productName: string;
}

export interface StorePriceComparison {
  brand: SupermarketBrand;
  totalPrice: number;
  itemsFound: number;
  itemsTotal: number;
  items: PriceResult[];
}

export interface NearbyStore {
  id: string;
  brand: SupermarketBrand;
  name: string;
  lat: number;
  lon: number;
  distance: number; // km
  address?: string;
}

export interface StoreRecommendation {
  store: NearbyStore;
  pricing: StorePriceComparison;
  score: number; // lower is better (price * distance weighting)
}

export interface UserLocation {
  lat: number;
  lon: number;
}
