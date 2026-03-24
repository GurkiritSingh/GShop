import { useState, useCallback } from 'react';
import type { ShoppingItem, GroceryCategory, DietaryTag } from '../types';

const STORAGE_KEY = 'gshop-shopping-list';

function loadFromStorage(): ShoppingItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as ShoppingItem[];
    // Migrate old items that don't have dietaryPrefs
    return parsed.map(item => ({
      ...item,
      dietaryPrefs: item.dietaryPrefs ?? [],
    }));
  } catch {
    return [];
  }
}

function saveToStorage(items: ShoppingItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>(loadFromStorage);

  const addItem = useCallback((name: string, category: GroceryCategory, quantity: number = 1, dietaryPrefs: DietaryTag[] = []) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name.toLowerCase() === name.toLowerCase());
      let next: ShoppingItem[];

      if (existing) {
        next = prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        const newItem: ShoppingItem = {
          id: crypto.randomUUID(),
          name: name.trim(),
          quantity,
          category,
          dietaryPrefs,
        };
        next = [...prev, newItem];
      }

      saveToStorage(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i));
      saveToStorage(next);
      return next;
    });
  }, []);

  const toggleItemDietary = useCallback((id: string, tag: DietaryTag) => {
    setItems((prev) => {
      const next = prev.map((i) => {
        if (i.id !== id) return i;
        const has = i.dietaryPrefs.includes(tag);
        return {
          ...i,
          dietaryPrefs: has
            ? i.dietaryPrefs.filter(t => t !== tag)
            : [...i.dietaryPrefs, tag],
        };
      });
      saveToStorage(next);
      return next;
    });
  }, []);

  const clearList = useCallback(() => {
    setItems([]);
    saveToStorage([]);
  }, []);

  const replaceList = useCallback((newItems: ShoppingItem[]) => {
    const migrated = newItems.map(i => ({ ...i, dietaryPrefs: i.dietaryPrefs ?? [] }));
    setItems(migrated);
    saveToStorage(migrated);
  }, []);

  return { items, addItem, removeItem, updateQuantity, toggleItemDietary, clearList, replaceList };
}
