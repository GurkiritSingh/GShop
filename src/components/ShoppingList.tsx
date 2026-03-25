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

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.trim().length > 0) {
      const filtered = availableItems.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="shopping-list">
      <div className="list-header">
        <h2>Shopping List</h2>
        {items.length > 0 && (
          <button className="btn-clear" onClick={onClearList}>
            Clear All
          </button>
        )}
      </div>

      <div className="add-item-form">
        <div className="input-row">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Add an item... (e.g. milk, bread, eggs)"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
            />
            {showSuggestions && (
              <div className="suggestions">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    className="suggestion-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleAdd(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as GroceryCategory)}
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button className="btn-add" onClick={() => handleAdd()}>
            Add
          </button>
        </div>

        <div className="quick-add">
          <span className="quick-add-label">Quick add:</span>
          {['milk', 'bread', 'eggs', 'bananas', 'chicken breast', 'pasta', 'rice'].map((item) => (
            <button
              key={item}
              className="quick-add-btn"
              onClick={() => onAddItem(item, 'other')}
            >
              {item}
            </button>
          ))}
        </div>

        <VoiceInput onAddItem={onAddItem} />
      </div>

      {items.length === 0 ? (
        <div className="empty-list">
          <p>Your shopping list is empty</p>
          <p className="empty-hint">Add items above to compare prices across UK supermarkets</p>
        </div>
      ) : (
        <div className="items-list">
          {items.map((item) => {
            const needsSpecial = dietaryFilters.length > 0 && !itemMatchesDietary(item.name, dietaryFilters);
            const matchedTags = dietaryFilters.filter(tag => !itemMatchesDietary(item.name, [tag]));
            const allergenWarnings = checkAllergenWarnings(item.name, allergens);
            const hasAllergenWarning = allergenWarnings.length > 0;

            return (
              <div key={item.id} className={`list-item ${needsSpecial ? 'needs-special' : ''} ${hasAllergenWarning ? 'has-allergen' : ''}`}>
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <div className="item-meta-row">
                    <span className="item-category">{CATEGORY_LABELS[item.category]}</span>
                    {needsSpecial && matchedTags.length > 0 && (
                      <span className="item-special-note">
                        needs {matchedTags.map(t => DIETARY_LABELS[t].label.toLowerCase()).join(', ')} version
                      </span>
                    )}
                  </div>
                  {hasAllergenWarning && (
                    <div className="allergen-warning">
                      &#x26A0;&#xFE0F; Contains: {allergenWarnings.join(', ')}
                    </div>
                  )}
                </div>
                <div className="item-controls">
                  <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="qty-display">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button className="btn-remove" onClick={() => onRemoveItem(item.id)}>
                    x
                  </button>
                </div>
              </div>
            );
          })}
          <div className="list-summary">
            {items.length} item{items.length !== 1 ? 's' : ''} in list
          </div>
        </div>
      )}
    </div>
  );
}
