import type { SupermarketBrand, NearbyStore, UserLocation } from '../types';

// OpenStreetMap brand name mappings — covers name, brand, and operator tags
const OSM_BRAND_MAP: Record<string, SupermarketBrand> = {
  // Big 4
  'tesco': 'tesco',
  'tesco express': 'tesco',
  'tesco extra': 'tesco',
  'tesco metro': 'tesco',
  'tesco superstore': 'tesco',
  'asda': 'asda',
  'asda superstore': 'asda',
  "sainsbury's": 'sainsburys',
  'sainsburys': 'sainsburys',
  "sainsbury's local": 'sainsburys',
  "sainsbury's superstore": 'sainsburys',
  'morrisons': 'morrisons',
  'morrisons daily': 'morrisons',
  // Discounters
  'aldi': 'aldi',
  'aldi sud': 'aldi',
  'aldi süd': 'aldi',
  'lidl': 'lidl',
  // Premium
  'waitrose': 'waitrose',
  'waitrose & partners': 'waitrose',
  'little waitrose': 'waitrose',
  'little waitrose & partners': 'waitrose',
  'marks & spencer': 'marks_spencer',
  'm&s': 'marks_spencer',
  'm&s food': 'marks_spencer',
  'm&s foodhall': 'marks_spencer',
  'm&s simply food': 'marks_spencer',
  'marks and spencer': 'marks_spencer',
  // Co-op
  'co-op': 'coop',
  'the co-operative': 'coop',
  'the co-operative food': 'coop',
  'coop': 'coop',
  'co-operative': 'coop',
  'co-op food': 'coop',
  'central co-op': 'coop',
  'midcounties co-operative': 'coop',
  'southern co-op': 'coop',
  'east of england co-op': 'coop',
  // Frozen / discount
  'iceland': 'iceland',
  'the food warehouse': 'iceland',
  'food warehouse': 'iceland',
  'farmfoods': 'farmfoods',
  'heron foods': 'heron_foods',
  'heron': 'heron_foods',
  'b&m bargains': 'bm',
  'b&m': 'bm',
  'b & m': 'bm',
  'b&m home store': 'bm',
  'home bargains': 'home_bargains',
  'poundland': 'poundland',
  // Convenience
  'spar': 'spar',
  'eurospar': 'spar',
  'costcutter': 'costcutter',
  'nisa': 'nisa',
  'nisa local': 'nisa',
  'nisa extra': 'nisa',
  'londis': 'londis',
  'budgens': 'budgens',
  // Online (won't appear in OSM but included for completeness)
  'ocado': 'ocado',
  'amazon fresh': 'amazon_fresh',
  'costco': 'costco',
  'costco wholesale': 'costco',
};

// Wikidata IDs for UK stores (very reliable for OSM matching)
const WIKIDATA_BRAND_MAP: Record<string, SupermarketBrand> = {
  'Q487494': 'tesco',
  'Q297410': 'asda',
  'Q152096': 'sainsburys',
  'Q922344': 'morrisons',
  'Q125054': 'aldi',
  'Q151954': 'lidl',
  'Q771734': 'waitrose',
  'Q3277439': 'coop',
  'Q714491': 'marks_spencer',
  'Q721810': 'iceland',
  'Q5431575': 'farmfoods',
  'Q5742694': 'heron_foods',
  'Q610492': 'spar',
  'Q5765547': 'costcutter',
  'Q6978945': 'nisa',
  'Q2066716': 'londis',
  'Q4985016': 'budgens',
  'Q9187104': 'home_bargains',
  'Q4836931': 'bm',
  'Q1557960': 'poundland',
  'Q1767519': 'ocado',
  'Q715583': 'costco',
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function matchBrand(tags: Record<string, string>): SupermarketBrand | null {
  // 1. Try wikidata ID first (most reliable)
  const wikidata = tags['brand:wikidata'] || tags['operator:wikidata'];
  if (wikidata && WIKIDATA_BRAND_MAP[wikidata]) {
    return WIKIDATA_BRAND_MAP[wikidata];
  }

  // 2. Try direct name/brand/operator matching
  const candidates = [
    tags['brand'],
    tags['name'],
    tags['operator'],
    tags['brand:en'],
  ].filter(Boolean);

  for (const candidate of candidates) {
    const lower = candidate!.toLowerCase().trim();

    // Direct match
    if (OSM_BRAND_MAP[lower]) return OSM_BRAND_MAP[lower];

    // Partial match — check if any key is contained in the candidate
    for (const [key, brand] of Object.entries(OSM_BRAND_MAP)) {
      if (lower.includes(key)) {
        return brand;
      }
    }
  }

  return null;
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function queryOverpass(query: string): Promise<Response> {
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.ok) return response;
      lastError = new Error(`Overpass API error: ${response.status}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('All Overpass endpoints failed');
}

export async function findNearbyStores(
  location: UserLocation,
  radiusKm: number = 10
): Promise<NearbyStore[]> {
  const radiusMeters = radiusKm * 1000;

  // Broad query: supermarkets, convenience stores, variety stores, wholesale
  const brandRegex = 'Tesco|Sainsbury|Co-op|Coop|Morrisons|M&S|Marks|Spar|Costcutter|Nisa|Londis|Budgens';
  const query = `
    [out:json][timeout:30];
    (
      node["shop"="supermarket"](around:${radiusMeters},${location.lat},${location.lon});
      way["shop"="supermarket"](around:${radiusMeters},${location.lat},${location.lon});
      relation["shop"="supermarket"](around:${radiusMeters},${location.lat},${location.lon});
      node["shop"="convenience"]["brand"~"${brandRegex}",i](around:${radiusMeters},${location.lat},${location.lon});
      way["shop"="convenience"]["brand"~"${brandRegex}",i](around:${radiusMeters},${location.lat},${location.lon});
      node["shop"="frozen_food"](around:${radiusMeters},${location.lat},${location.lon});
      way["shop"="frozen_food"](around:${radiusMeters},${location.lat},${location.lon});
      node["shop"="variety_store"]["brand"~"B&M|Poundland|Home Bargains",i](around:${radiusMeters},${location.lat},${location.lon});
      way["shop"="variety_store"]["brand"~"B&M|Poundland|Home Bargains",i](around:${radiusMeters},${location.lat},${location.lon});
      node["shop"="wholesale"]["brand"~"Costco",i](around:${radiusMeters},${location.lat},${location.lon});
      way["shop"="wholesale"]["brand"~"Costco",i](around:${radiusMeters},${location.lat},${location.lon});
    );
    out center body;
  `;

  try {
    const response = await queryOverpass(query);
    const data = await response.json();

    console.log(`Overpass returned ${data.elements?.length ?? 0} elements`);

    const stores: NearbyStore[] = [];
    const seen = new Set<string>();

    for (const element of data.elements || []) {
      const tags = element.tags || {};
      const brand = matchBrand(tags);

      if (!brand) {
        // Log unmatched stores for debugging
        if (tags.name) {
          console.log('Unmatched store:', tags.name, tags.brand);
        }
        continue;
      }

      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;
      if (lat == null || lon == null) continue;

      // Deduplicate by rounding coords (some stores appear as both node and way)
      const dedupeKey = `${brand}-${lat.toFixed(4)}-${lon.toFixed(4)}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const distance = haversineDistance(location.lat, location.lon, lat, lon);
      const name = tags.name || tags.brand || brand;

      const address = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:city'],
        tags['addr:postcode'],
      ]
        .filter(Boolean)
        .join(', ');

      stores.push({
        id: `${element.type}-${element.id}`,
        brand,
        name,
        lat,
        lon,
        distance: Math.round(distance * 100) / 100,
        address: address || undefined,
      });
    }

    console.log(`Matched ${stores.length} UK supermarket stores`);
    return stores.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Failed to fetch nearby stores:', error);
    throw error;
  }
}

export function getClosestStorePerBrand(stores: NearbyStore[]): NearbyStore[] {
  const closest: Partial<Record<SupermarketBrand, NearbyStore>> = {};

  for (const store of stores) {
    if (!closest[store.brand] || store.distance < closest[store.brand]!.distance) {
      closest[store.brand] = store;
    }
  }

  return Object.values(closest)
    .filter((s): s is NearbyStore => s !== undefined)
    .sort((a, b) => a.distance - b.distance);
}

export function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Location error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
}
