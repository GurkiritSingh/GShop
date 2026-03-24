import type {
  ShoppingItem,
  NearbyStore,
  StoreRecommendation,
} from '../types';
import { comparePricesForList } from './priceService';
import { getClosestStorePerBrand } from './storeLocator';

export function getRecommendations(
  items: ShoppingItem[],
  stores: NearbyStore[]
): StoreRecommendation[] {
  if (items.length === 0 || stores.length === 0) return [];

  const priceComparisons = comparePricesForList(items);
  const closestStores = getClosestStorePerBrand(stores);

  const recommendations: StoreRecommendation[] = [];

  for (const store of closestStores) {
    const pricing = priceComparisons.find((p) => p.brand === store.brand);
    if (!pricing || pricing.itemsFound === 0) continue;

    // Score: weighted combination of normalised price and distance
    // Lower score = better recommendation
    const coverageRatio = pricing.itemsFound / pricing.itemsTotal;
    const pricePerItem = pricing.totalPrice / pricing.itemsFound;
    const distancePenalty = store.distance * 0.5; // 50p per km as travel cost
    const coveragePenalty = (1 - coverageRatio) * 5; // penalise missing items

    const score = pricePerItem + distancePenalty + coveragePenalty;

    recommendations.push({
      store,
      pricing,
      score: Math.round(score * 100) / 100,
    });
  }

  return recommendations.sort((a, b) => a.score - b.score);
}

export function formatPrice(price: number): string {
  return `\u00A3${price.toFixed(2)}`;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}
