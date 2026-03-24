import type { ShoppingItem, DietaryTag } from '../types';

export interface SavedList {
  id: string;
  name: string;
  items: ShoppingItem[];
  dietary: DietaryTag[];
  createdAt: number;
}

const STORAGE_KEY = 'gshop-saved-lists';

export function loadSavedLists(): SavedList[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveLists(lists: SavedList[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function createSavedList(name: string, items: ShoppingItem[], dietary: DietaryTag[]): SavedList {
  return {
    id: `list-${Date.now()}`,
    name: name.trim(),
    items: items.map(i => ({ ...i })),
    dietary: [...dietary],
    createdAt: Date.now(),
  };
}
