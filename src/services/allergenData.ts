// Maps food items to their common allergens.
// Based on UK Food Standards Agency allergen labelling (the 14 major allergens).
// Items not listed are assumed allergen-free or unknown.

const ITEM_ALLERGENS: Record<string, string[]> = {
  // ===== Dairy / contains milk =====
  'milk': ['milk'],
  'whole milk': ['milk'],
  'skimmed milk': ['milk'],
  'cheese': ['milk'],
  'mild cheddar': ['milk'],
  'mozzarella': ['milk'],
  'parmesan': ['milk'],
  'brie': ['milk'],
  'cream cheese': ['milk'],
  'feta': ['milk'],
  'halloumi': ['milk'],
  'grated cheese': ['milk'],
  'cheese slices': ['milk'],
  'butter': ['milk'],
  'double cream': ['milk'],
  'single cream': ['milk'],
  'sour cream': ['milk'],
  'creme fraiche': ['milk'],
  'yoghurt': ['milk'],
  'fruit yoghurt': ['milk'],
  'custard': ['milk', 'eggs'],
  'ice cream': ['milk', 'eggs'],
  'margarine': ['milk'],
  // Branded dairy
  'lurpak': ['milk'],
  'lurpak butter': ['milk'],
  'anchor butter': ['milk'],
  'cathedral city': ['milk'],
  'philadelphia': ['milk'],
  'dairylea': ['milk'],
  'babybel': ['milk'],
  'muller yoghurt': ['milk'],
  'muller corner': ['milk'],
  'muller rice': ['milk'],
  'activia': ['milk'],
  'petit filous': ['milk'],
  'cravendale milk': ['milk'],
  'ben and jerrys': ['milk', 'eggs', 'soy'],
  'haagen dazs': ['milk', 'eggs'],
  'magnum': ['milk', 'soy'],
  'cornetto': ['milk', 'soy', 'gluten'],
  'viennetta': ['milk', 'soy', 'gluten'],

  // ===== Eggs =====
  'eggs': ['eggs'],
  'mayonnaise': ['eggs'],
  'hellmanns mayo': ['eggs'],
  'heinz mayo': ['eggs'],
  'scotch eggs': ['eggs', 'gluten'],
  'quiche': ['eggs', 'milk', 'gluten'],
  'pancakes': ['eggs', 'milk', 'gluten'],
  'croissants': ['eggs', 'milk', 'gluten'],
  'brioche': ['eggs', 'milk', 'gluten'],
  'cake': ['eggs', 'milk', 'gluten'],
  'doughnuts': ['eggs', 'milk', 'gluten'],
  'muffins': ['eggs', 'milk', 'gluten'],
  'mr kipling': ['eggs', 'milk', 'gluten'],

  // ===== Gluten (wheat, barley, rye, oats) =====
  'bread': ['gluten'],
  'wholemeal bread': ['gluten'],
  'brown bread': ['gluten'],
  'sourdough': ['gluten'],
  'rolls': ['gluten'],
  'wraps': ['gluten'],
  'pitta bread': ['gluten'],
  'naan bread': ['gluten', 'milk'],
  'bagels': ['gluten', 'sesame'],
  'crumpets': ['gluten'],
  'english muffins': ['gluten'],
  'hot dog buns': ['gluten'],
  'burger buns': ['gluten'],
  'garlic bread': ['gluten', 'milk'],
  'breadsticks': ['gluten'],
  'pasta': ['gluten'],
  'spaghetti pasta': ['gluten'],
  'fusilli': ['gluten'],
  'tagliatelle': ['gluten', 'eggs'],
  'lasagne sheets': ['gluten'],
  'noodles': ['gluten', 'eggs'],
  'couscous': ['gluten'],
  'flour': ['gluten'],
  'self raising flour': ['gluten'],
  'bread flour': ['gluten'],
  'biscuits': ['gluten', 'milk'],
  'digestives': ['gluten', 'milk'],
  'chocolate biscuits': ['gluten', 'milk', 'soy'],
  'hobnobs': ['gluten'],
  'custard creams': ['gluten', 'milk'],
  'crackers': ['gluten'],
  'cereal': ['gluten'],
  'porridge oats': ['gluten'],
  'muesli': ['gluten', 'nuts'],
  'granola': ['gluten', 'nuts'],
  'fish fingers': ['fish', 'gluten'],
  'chicken nuggets': ['gluten'],
  'pizza': ['gluten', 'milk'],
  'sausages': ['gluten', 'sulphites'],
  'bacon': ['sulphites'],
  'vinegar': ['sulphites'],
  'sausage rolls': ['gluten', 'milk'],
  'beer': ['gluten'],
  'cider': ['gluten'],
  // Branded gluten
  'warburtons': ['gluten'],
  'hovis': ['gluten'],
  'kingsmill': ['gluten'],
  'mcvities digestives': ['gluten', 'milk'],
  'mcvities chocolate digestives': ['gluten', 'milk', 'soy'],
  'mcvities hobnobs': ['gluten'],
  'oreo': ['gluten', 'soy'],
  'kitkats': ['gluten', 'milk', 'soy'],
  'weetabix': ['gluten'],
  'kelloggs cornflakes': ['gluten'],
  'kelloggs crunchy nut': ['gluten', 'nuts'],
  'shreddies': ['gluten'],
  'walkers crisps': ['gluten'],
  'pringles': ['gluten'],
  'doritos': ['gluten'],
  'pot noodle': ['gluten', 'soy'],
  'super noodles': ['gluten'],

  // ===== Nuts =====
  'nuts': ['nuts'],
  'peanuts': ['peanuts'],
  'cashews': ['nuts'],
  'trail mix': ['nuts', 'peanuts'],
  'peanut butter': ['peanuts'],
  'nutella': ['nuts', 'milk', 'soy'],
  'almond milk': ['nuts'],

  // ===== Soy =====
  'soy sauce': ['soy', 'gluten'],
  'soy milk': ['soy'],
  'tofu': ['soy'],
  'chocolate': ['soy', 'milk'],
  'dark chocolate': ['soy'],
  'cadbury dairy milk': ['milk', 'soy'],
  'galaxy': ['milk', 'soy'],
  'maltesers': ['milk', 'soy', 'gluten'],
  'celebrations': ['milk', 'soy', 'nuts', 'gluten'],
  'quality street': ['milk', 'soy', 'nuts', 'gluten'],
  'heroes': ['milk', 'soy', 'nuts', 'gluten'],
  'ferrero rocher': ['milk', 'nuts', 'soy', 'gluten'],

  // ===== Fish =====
  'salmon': ['fish'],
  'cod': ['fish'],
  'haddock': ['fish'],
  'tuna': ['fish'],
  'tuna steaks': ['fish'],
  'mackerel': ['fish'],
  'sardines': ['fish'],
  'fish cakes': ['fish', 'gluten'],
  // fish fingers already in gluten section

  // ===== Crustaceans / Molluscs =====
  'prawns': ['crustaceans'],
  'frozen prawns': ['crustaceans'],

  // ===== Celery =====
  'celery': ['celery'],
  'soup': ['celery'],
  'stock cubes': ['celery'],
  'oxo cubes': ['celery'],
  'bisto gravy': ['celery', 'gluten'],
  'gravy granules': ['celery', 'gluten'],

  // ===== Mustard =====
  'mustard': ['mustard'],
  'colmans mustard': ['mustard'],
  'curry paste': ['mustard'],
  'tikka paste': ['mustard'],
  'curry powder': ['mustard'],

  // ===== Sesame =====
  'hummus': ['sesame'],
  // bagels already in gluten section with sesame

  // ===== Sulphites =====
  'wine': ['sulphites'],
  'dried fruit': ['sulphites'],
  'raisins': ['sulphites'],
  // sausages already in gluten section with sulphites
  // bacon already listed above
};

// The 14 UK allergens for reference
export const UK_ALLERGENS = [
  'milk', 'eggs', 'peanuts', 'nuts', 'gluten', 'soy', 'fish',
  'crustaceans', 'molluscs', 'celery', 'mustard', 'sesame',
  'sulphites', 'lupin',
];

export function getAllergensForItem(itemName: string): string[] {
  const lower = itemName.toLowerCase().trim();

  // Direct match
  if (ITEM_ALLERGENS[lower]) return ITEM_ALLERGENS[lower];

  // Partial match
  for (const [key, allergens] of Object.entries(ITEM_ALLERGENS)) {
    if (lower.includes(key) || key.includes(lower)) return allergens;
  }

  return [];
}

export function checkAllergenWarnings(itemName: string, userAllergens: string[]): string[] {
  if (userAllergens.length === 0) return [];

  const itemAllergens = getAllergensForItem(itemName);
  if (itemAllergens.length === 0) return [];

  const warnings: string[] = [];
  for (const userAllergen of userAllergens) {
    const lower = userAllergen.toLowerCase().trim();
    for (const itemAllergen of itemAllergens) {
      // Fuzzy match: "nut" matches "nuts", "peanut" matches "peanuts"
      if (
        itemAllergen.includes(lower) ||
        lower.includes(itemAllergen) ||
        // Handle common variants
        (lower === 'dairy' && itemAllergen === 'milk') ||
        (lower === 'wheat' && itemAllergen === 'gluten') ||
        (lower === 'shellfish' && (itemAllergen === 'crustaceans' || itemAllergen === 'molluscs')) ||
        (lower === 'tree nuts' && itemAllergen === 'nuts') ||
        (lower === 'peanut' && itemAllergen === 'peanuts') ||
        (lower === 'nut' && (itemAllergen === 'nuts' || itemAllergen === 'peanuts'))
      ) {
        warnings.push(itemAllergen);
      }
    }
  }

  return [...new Set(warnings)];
}
