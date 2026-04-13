import { useState } from 'react';
import type { ShoppingItem, GroceryCategory, DietaryTag } from '../types';
import { CATEGORY_LABELS, DIETARY_LABELS } from '../types';
import { getAvailableItems } from '../services/priceService';
import { itemMatchesDietary } from '../services/dietaryData';
import { checkAllergenWarnings } from '../services/allergenData';
import { VoiceInput } from './VoiceInput';

interface ShoppingListProps {
  items: ShoppingItem[];
  dietaryFilters: DietaryTag[];
  allergens: string[];
  onAddItem: (name: string, category: GroceryCategory, quantity?: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClearList: () => void;
}

const availableItems = getAvailableItems();

const CATEGORY_EMOJI: Record<GroceryCategory, string> = {
  fruit_veg: '\uD83C\uDF4E',
  meat_fish: '\uD83E\uDD69',
  dairy: '\uD83E\uDD5B',
  bakery: '\uD83C\uDF5E',
  drinks: '\uD83E\uDD64',
  snacks: '\uD83C\uDF6B',
  household: '\uD83C\uDFE0',
  frozen: '\uD83E\uDDCA',
  tinned: '\uD83E\uDD6B',
  other: '\uD83D\uDCE6',
};

export function ShoppingList({
  items,
  dietaryFilters,
  allergens,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onClearList,
}: ShoppingListProps) {
  const [inputValue, setInputValue] = useState('');
  const [category, setCategory] = useState<GroceryCategory>('other');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [ticked, setTicked] = useState<Set<string>>(new Set());

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.trim().length > 0) {
      const filtered = availableItems.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAdd = (name?: string) => {
    const itemName = name || inputValue.trim();
    if (!itemName) return;
    onAddItem(itemName, category);
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const toggleTicked = (id: string) => {
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group items by category
  const grouped = items.reduce<Record<GroceryCategory, ShoppingItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<GroceryCategory, ShoppingItem[]>);

  const orderedCategories = (Object.keys(CATEGORY_LABELS) as GroceryCategory[]).filter((c) => grouped[c] && grouped[c].length > 0);

  return (
    <section className="space-y-6">
      {/* Add item input */}
      <div className="relative">
        <input
          type="text"
          className="w-full h-14 rounded-xl border-none px-6 pr-20 focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-highest dark:bg-slate-800 text-on-surface dark:text-white placeholder:text-outline outline-none"
          placeholder="Add an item... (e.g. milk, bread, eggs)"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
        />
        <button
          onClick={() => handleAdd()}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold text-sm flex items-center gap-1 hover:bg-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add
        </button>
        {showSuggestions && (
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-outline-variant/20 z-10 overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleAdd(s)}
                className="w-full text-left px-4 py-3 hover:bg-surface-container-low dark:hover:bg-slate-700 text-on-surface dark:text-white text-sm"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category selector */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold uppercase tracking-wider text-outline whitespace-nowrap">Category:</span>
        {(Object.entries(CATEGORY_LABELS) as [GroceryCategory, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              category === key
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container-high dark:bg-slate-800 text-on-surface-variant dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
            }`}
          >
            {CATEGORY_EMOJI[key]} {label}
          </button>
        ))}
      </div>

      {/* Quick add chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-outline self-center">Quick add:</span>
        {['milk', 'bread', 'eggs', 'bananas', 'chicken breast', 'pasta', 'rice'].map((item) => (
          <button
            key={item}
            onClick={() => onAddItem(item, 'other')}
            className="px-3 py-1.5 rounded-full bg-surface-container-low dark:bg-slate-800 text-on-surface-variant dark:text-slate-300 text-xs font-medium hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            + {item}
          </button>
        ))}
      </div>

      <VoiceInput onAddItem={onAddItem} />

      {/* List header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-on-surface dark:text-white">
          Shopping List {items.length > 0 && <span className="text-outline font-normal text-base">· {items.length} {items.length === 1 ? 'item' : 'items'}</span>}
        </h2>
        {items.length > 0 && (
          <button onClick={onClearList} className="text-xs font-bold text-error hover:underline">Clear all</button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="bg-surface-container-lowest dark:bg-slate-800/50 rounded-2xl p-10 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">shopping_basket</span>
          <p className="font-semibold text-on-surface dark:text-white">Your shopping list is empty</p>
          <p className="text-sm text-outline mt-1">Add items above to compare prices across UK supermarkets</p>
        </div>
      )}

      {/* Grouped items — 1 col on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {orderedCategories.map((cat) => (
        <div key={cat}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{CATEGORY_EMOJI[cat]}</span>
            <h3 className="text-lg font-extrabold tracking-tight text-on-surface dark:text-white">{CATEGORY_LABELS[cat]}</h3>
          </div>
          <div className="space-y-3">
            {grouped[cat].map((item) => {
              const isTicked = ticked.has(item.id);
              const needsSpecial = dietaryFilters.length > 0 && !itemMatchesDietary(item.name, dietaryFilters);
              const matchedTags = dietaryFilters.filter((tag) => !itemMatchesDietary(item.name, [tag]));
              const allergenWarnings = checkAllergenWarnings(item.name, allergens);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-4 rounded-xl shadow-[0px_8px_24px_rgba(21,28,37,0.02)] border transition-all ${
                    allergenWarnings.length > 0
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-surface-container-lowest dark:bg-slate-800 border-outline-variant/10'
                  }`}
                >
                  <button
                    onClick={() => toggleTicked(item.id)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                      isTicked
                        ? 'bg-secondary-container'
                        : 'border-2 border-primary-container bg-white dark:bg-slate-700'
                    }`}
                    aria-label={isTicked ? 'Untick' : 'Tick off'}
                  >
                    {isTicked && (
                      <span className="material-symbols-outlined text-on-secondary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${isTicked ? 'text-outline line-through' : 'text-on-surface dark:text-white'}`}>{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${isTicked ? 'text-outline/60 line-through' : 'text-outline'}`}>qty {item.quantity}</span>
                      {needsSpecial && matchedTags.length > 0 && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          needs {matchedTags.map((t) => DIETARY_LABELS[t].label.toLowerCase()).join(', ')}
                        </span>
                      )}
                    </div>
                    {allergenWarnings.length > 0 && (
                      <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 mt-1">
                        &#9888;&#65039; Contains: {allergenWarnings.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded-full bg-surface-container-high dark:bg-slate-700 text-on-surface dark:text-white font-bold disabled:opacity-30 hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    >
                      −
                    </button>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-surface-container-high dark:bg-slate-700 text-on-surface dark:text-white font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="w-8 h-8 rounded-full text-error hover:bg-error/10 transition-colors flex items-center justify-center"
                      aria-label="Remove"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      </div>
    </section>
  );
}
