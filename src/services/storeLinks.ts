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

export function getProductSearchUrl(brand: SupermarketBrand, productName: string): string | null {
  const baseUrl = STORE_SEARCH_URLS[brand];
  if (!baseUrl) return null;

  // Extract the core item name from the product name (strip store prefix)
  const cleanName = productName
    .replace(/^(Tesco|ASDA|Sainsbury's|Morrisons|Aldi|Lidl|Waitrose|Co-op|M&S|Iceland|Farmfoods|Heron Foods|Spar|Costcutter|Nisa|Londis|Budgens|Home Bargains|B&M|Poundland|Ocado|Amazon Fresh|Kirkland\/Costco)\s+/i, '')
    .trim();

  return baseUrl + encodeURIComponent(cleanName);
}

export function hasStoreLink(brand: SupermarketBrand): boolean {
  return brand in STORE_SEARCH_URLS;
}
