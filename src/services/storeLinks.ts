import type { SupermarketBrand } from '../types';

const STORE_SEARCH_URLS: Partial<Record<SupermarketBrand, string>> = {
  tesco:         'https://www.tesco.com/groceries/en-GB/search?query=',
  asda:          'https://groceries.asda.com/search/',
  sainsburys:    'https://www.sainsburys.co.uk/gol-ui/SearchResults/',
  morrisons:     'https://groceries.morrisons.com/search?entry=',
  aldi:          'https://groceries.aldi.co.uk/en-GB/Search?keywords=',
  waitrose:      'https://www.waitrose.com/ecom/shop/search?searchTerm=',
  coop:          'https://shop.coop.co.uk/search?query=',
  marks_spencer: 'https://www.ocado.com/search?entry=',
  iceland:       'https://www.iceland.co.uk/search?q=',
  ocado:         'https://www.ocado.com/search?entry=',
  amazon_fresh:  'https://www.amazon.co.uk/s?i=amazonfresh&k=',
  costco:        'https://www.costco.co.uk/search?text=',
  home_bargains: 'https://www.homebargains.co.uk/search?q=',
  bm:            'https://www.bmstores.co.uk/search?q=',
  poundland:     'https://www.poundland.co.uk/catalogsearch/result/?q=',
};

// Strip store prefix and clean up the product name for better search results
function cleanProductName(productName: string): string {
  return productName
    // Strip store name prefix
    .replace(/^(Tesco|ASDA|Sainsbury's|Morrisons|Aldi|Lidl|Waitrose|Co-op|M&S|Iceland|Farmfoods|Heron Foods|Spar|Costcutter|Nisa|Londis|Budgens|Home Bargains|B&M|Poundland|Ocado|Amazon Fresh|Kirkland\/Costco)\s+/i, '')
    // Strip pack size/weight at the end — stores search better without these
    .replace(/\s+\d+\s*(g|kg|ml|l|cl|pk|pack|rolls?|pieces?)\b.*$/i, '')
    // Strip "x Number" patterns like "6 Pack", "10 Pack"
    .replace(/\s+\d+\s*pack$/i, '')
    // Strip trailing numbers that are just sizes
    .replace(/\s+\d+$/, '')
    .trim();
}

// Some items need totally different search terms per store
const SEARCH_OVERRIDES: Partial<Record<SupermarketBrand, Record<string, string>>> = {
  // Sainsbury's uses different URL structure for some products
  sainsburys: {
    'Semi Skimmed Milk': 'semi skimmed milk',
    'Free Range Eggs': 'free range eggs',
  },
};

export function getProductSearchUrl(brand: SupermarketBrand, productName: string): string | null {
  const baseUrl = STORE_SEARCH_URLS[brand];
  if (!baseUrl) return null;

  // Check overrides first
  const overrides = SEARCH_OVERRIDES[brand];
  if (overrides) {
    for (const [key, searchTerm] of Object.entries(overrides)) {
      if (productName.includes(key)) {
        return baseUrl + encodeURIComponent(searchTerm);
      }
    }
  }

  const cleanName = cleanProductName(productName);
  return baseUrl + encodeURIComponent(cleanName);
}

export function hasStoreLink(brand: SupermarketBrand): boolean {
  return brand in STORE_SEARCH_URLS;
}
