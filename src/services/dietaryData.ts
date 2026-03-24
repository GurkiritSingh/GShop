import type { DietaryTag } from '../types';

// Dietary tags for items in the price database.
// If an item is NOT listed here it's assumed to have no specific tags.
// Items are tagged conservatively — only marked if the typical supermarket version qualifies.
const ITEM_DIETARY_TAGS: Record<string, DietaryTag[]> = {
  // ===== Fruit & Veg (all naturally vegan, GF, dairy-free, halal, kosher, nut-free) =====
  ...Object.fromEntries([
    'bananas', 'apples', 'oranges', 'lemons', 'limes', 'grapes', 'strawberries',
    'blueberries', 'raspberries', 'pears', 'kiwi', 'mango', 'pineapple', 'melon',
    'watermelon', 'avocado', 'tomatoes', 'cherry tomatoes', 'potatoes', 'sweet potatoes',
    'onions', 'red onion', 'spring onions', 'carrots', 'broccoli', 'cauliflower',
    'cabbage', 'spinach', 'lettuce', 'cucumber', 'peppers', 'mushrooms', 'courgette',
    'aubergine', 'green beans', 'sweetcorn', 'peas', 'celery', 'garlic', 'ginger',
    'chillies', 'parsnips', 'swede', 'beetroot', 'leeks', 'asparagus', 'salad',
    'rocket', 'herbs', 'basil', 'corn on the cob',
  ].map(i => [i, ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'] as DietaryTag[]])),

  // ===== Meat (halal only if from halal source — we tag conservatively) =====
  'chicken breast':     ['gluten_free', 'dairy_free', 'nut_free'],
  'chicken thighs':     ['gluten_free', 'dairy_free', 'nut_free'],
  'whole chicken':      ['gluten_free', 'dairy_free', 'nut_free'],
  'chicken wings':      ['gluten_free', 'dairy_free', 'nut_free'],
  'chicken drumsticks': ['gluten_free', 'dairy_free', 'nut_free'],
  'turkey mince':       ['gluten_free', 'dairy_free', 'nut_free', 'halal'],
  'mince beef':         ['gluten_free', 'dairy_free', 'nut_free'],
  'lean mince':         ['gluten_free', 'dairy_free', 'nut_free'],
  'steak':              ['gluten_free', 'dairy_free', 'nut_free'],
  'beef stewing':       ['gluten_free', 'dairy_free', 'nut_free'],
  'lamb chops':         ['gluten_free', 'dairy_free', 'nut_free', 'halal'],
  'lamb mince':         ['gluten_free', 'dairy_free', 'nut_free', 'halal'],
  'lamb leg':           ['gluten_free', 'dairy_free', 'nut_free', 'halal'],
  'salmon':             ['gluten_free', 'dairy_free', 'nut_free', 'halal', 'kosher'],
  'cod':                ['gluten_free', 'dairy_free', 'nut_free', 'halal', 'kosher'],
  'haddock':            ['gluten_free', 'dairy_free', 'nut_free', 'halal', 'kosher'],
  'prawns':             ['gluten_free', 'dairy_free', 'nut_free', 'halal'],
  'tuna steaks':        ['gluten_free', 'dairy_free', 'nut_free', 'halal', 'kosher'],
  'mackerel':           ['gluten_free', 'dairy_free', 'nut_free', 'halal', 'kosher'],

  // Pork — NOT halal, NOT kosher
  'bacon':              ['gluten_free', 'dairy_free', 'nut_free'],
  'sausages':           ['dairy_free', 'nut_free'],
  'ham':                ['gluten_free', 'dairy_free', 'nut_free'],
  'pork chops':         ['gluten_free', 'dairy_free', 'nut_free'],
  'pork mince':         ['gluten_free', 'dairy_free', 'nut_free'],
  'pork belly':         ['gluten_free', 'dairy_free', 'nut_free'],
  'gammon':             ['gluten_free', 'dairy_free', 'nut_free'],
  'salami':             ['gluten_free', 'dairy_free', 'nut_free'],
  'chorizo':            ['gluten_free', 'dairy_free', 'nut_free'],
  'pepperoni':          ['dairy_free', 'nut_free'],

  // ===== Dairy (vegetarian, GF, halal, nut-free) =====
  'milk':               ['vegetarian', 'gluten_free', 'halal', 'nut_free', 'kosher'],
  'whole milk':         ['vegetarian', 'gluten_free', 'halal', 'nut_free', 'kosher'],
  'skimmed milk':       ['vegetarian', 'gluten_free', 'halal', 'nut_free', 'kosher'],
  'eggs':               ['vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'cheese':             ['vegetarian', 'gluten_free', 'halal', 'nut_free'],
  'mild cheddar':       ['vegetarian', 'gluten_free', 'halal', 'nut_free'],
  'mozzarella':         ['vegetarian', 'gluten_free', 'halal', 'nut_free'],
  'butter':             ['vegetarian', 'gluten_free', 'halal', 'nut_free', 'kosher'],
  'double cream':       ['vegetarian', 'gluten_free', 'halal', 'nut_free', 'kosher'],
  'single cream':       ['vegetarian', 'gluten_free', 'halal', 'nut_free', 'kosher'],
  'yoghurt':            ['vegetarian', 'gluten_free', 'halal', 'nut_free'],
  'cream cheese':       ['vegetarian', 'gluten_free', 'halal', 'nut_free'],
  'halloumi':           ['vegetarian', 'gluten_free', 'halal', 'nut_free'],
  'feta':               ['vegetarian', 'gluten_free', 'halal', 'nut_free'],

  // Plant milks (vegan, GF, dairy-free, halal)
  'oat milk':           ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'almond milk':        ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'kosher'],
  'soy milk':           ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],

  // ===== Bakery =====
  'bread':              ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free'],
  'wholemeal bread':    ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free'],
  'brown bread':        ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free'],
  'rolls':              ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free'],
  'wraps':              ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free'],
  'pitta bread':        ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free'],
  'naan bread':         ['vegetarian', 'halal', 'nut_free'],
  'bagels':             ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free'],
  'crumpets':           ['vegetarian', 'dairy_free', 'halal', 'nut_free'],

  // Gluten-free bakery items would be separate products (not in our DB yet)

  // ===== Pasta / Rice / Staples =====
  'pasta':              ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'spaghetti pasta':    ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'fusilli':            ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'rice':               ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'basmati rice':       ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'brown rice':         ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'couscous':           ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free'],
  'quinoa':             ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'noodles':            ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free'],
  'flour':              ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'sugar':              ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'porridge oats':      ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free'],
  'cereal':             ['vegetarian', 'dairy_free', 'halal', 'nut_free'],

  // ===== Cooking oils & condiments =====
  'cooking oil':        ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'olive oil':          ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'extra virgin olive oil': ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'sunflower oil':      ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'vinegar':            ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'soy sauce':          ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free'],
  'ketchup':            ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free'],
  'salt':               ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'pepper':             ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'mixed herbs':        ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'stock cubes':        ['dairy_free', 'nut_free'],
  'honey':              ['vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'jam':                ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free'],
  'peanut butter':      ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal'],
  'pasta sauce':        ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free'],

  // ===== Tinned =====
  'baked beans':        ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free'],
  'chopped tomatoes':   ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'tuna':               ['gluten_free', 'dairy_free', 'nut_free', 'halal', 'kosher'],
  'chickpeas':          ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'kidney beans':       ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'coconut milk':       ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'lentils':            ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],

  // ===== Drinks =====
  'tea':                ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'coffee':             ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'orange juice':       ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'apple juice':        ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'squash':             ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free'],
  'cola':               ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free'],
  'lemonade':           ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free'],
  'still water':        ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'sparkling water':    ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],

  // ===== Frozen =====
  'frozen peas':        ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'frozen sweetcorn':   ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'],
  'frozen veg':         ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free'],
  'chips':              ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free'],

  // ===== Household (N/A but tag as all-safe since not food) =====
  ...Object.fromEntries([
    'toilet roll', 'kitchen roll', 'bin bags', 'cling film', 'tin foil',
    'washing up liquid', 'bleach', 'all purpose cleaner', 'laundry detergent',
    'fabric softener', 'dishwasher tablets', 'hand soap', 'shower gel',
    'shampoo', 'conditioner', 'toothpaste', 'toothbrush', 'deodorant',
    'tissues', 'nappies', 'baby wipes', 'sponges',
  ].map(i => [i, ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free', 'kosher'] as DietaryTag[]])),

  // ===== Vegan alternatives =====
  'quorn mince':        ['vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free'],
  'quorn':              ['vegetarian', 'gluten_free', 'dairy_free', 'halal', 'nut_free'],
  'linda mccartney':    ['vegan', 'vegetarian', 'dairy_free', 'halal', 'nut_free'],
};

export function getDietaryTags(itemName: string): DietaryTag[] {
  const lower = itemName.toLowerCase().trim();
  if (ITEM_DIETARY_TAGS[lower]) return ITEM_DIETARY_TAGS[lower];

  // Partial match
  for (const [key, tags] of Object.entries(ITEM_DIETARY_TAGS)) {
    if (lower.includes(key) || key.includes(lower)) return tags;
  }

  return []; // unknown items have no tags
}

export function itemMatchesDietary(itemName: string, requiredTags: DietaryTag[]): boolean {
  if (requiredTags.length === 0) return true;
  const itemTags = getDietaryTags(itemName);
  if (itemTags.length === 0) return true; // untagged items pass through
  return requiredTags.every(tag => itemTags.includes(tag));
}
