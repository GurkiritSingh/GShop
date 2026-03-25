import { useState } from 'react';
import type { DietaryTag } from '../types';
import { DIETARY_LABELS } from '../types';

interface DietaryBarProps {
  active: DietaryTag[];
  onChange: (tags: DietaryTag[]) => void;
  allergens: string[];
  onAllergensChange: (allergens: string[]) => void;
}

const ALL_TAGS: DietaryTag[] = ['halal', 'vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'nut_free', 'kosher'];

const COMMON_ALLERGENS = [
  'milk', 'eggs', 'peanuts', 'nuts', 'gluten', 'soy', 'fish',
  'shellfish', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin',
];

export function DietaryBar({ active, onChange, allergens, onAllergensChange }: DietaryBarProps) {
  const [allergenInput, setAllergenInput] = useState('');
  const [showAllergens, setShowAllergens] = useState(allergens.length > 0);

  const toggle = (tag: DietaryTag) => {
    onChange(
      active.includes(tag)
        ? active.filter(t => t !== tag)
        : [...active, tag]
    );
  };

  const addAllergen = (name?: string) => {
    const value = (name || allergenInput).trim().toLowerCase();
    if (!value || allergens.includes(value)) return;
    onAllergensChange([...allergens, value]);
    setAllergenInput('');
  };

  const removeAllergen = (allergen: string) => {
    onAllergensChange(allergens.filter(a => a !== allergen));
  };

  return (
    <div className="dietary-bar">
      <div className="dietary-bar-row">
        <span className="dietary-bar-label">Dietary:</span>
        <div className="dietary-bar-chips">
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              className={`dietary-bar-chip ${active.includes(tag) ? 'active' : ''}`}
              onClick={() => toggle(tag)}
            >
              {DIETARY_LABELS[tag].icon} {DIETARY_LABELS[tag].label}
            </button>
          ))}
        </div>
        {active.length > 0 && (
          <button className="dietary-bar-clear" onClick={() => onChange([])}>
            Clear
          </button>
        )}
      </div>

      <div className="allergen-section">
        <button
          className="allergen-toggle-btn"
          onClick={() => setShowAllergens(!showAllergens)}
        >
          {showAllergens ? 'Hide allergies' : `Allergies${allergens.length > 0 ? ` (${allergens.length})` : ''}`}
          {allergens.length > 0 && !showAllergens && (
            <span className="allergen-warning-dot"></span>
          )}
        </button>

        {showAllergens && (
          <div className="allergen-panel">
            <div className="allergen-input-row">
              <input
                type="text"
                placeholder="Type an allergy (e.g. sesame, shellfish, soy)"
                value={allergenInput}
                onChange={e => setAllergenInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addAllergen(); }}
              />
              <button className="allergen-add-btn" onClick={() => addAllergen()}>Add</button>
            </div>

            <div className="allergen-suggestions">
              {COMMON_ALLERGENS.filter(a => !allergens.includes(a)).map(a => (
                <button key={a} className="allergen-suggest-chip" onClick={() => addAllergen(a)}>
                  + {a}
                </button>
              ))}
            </div>

            {allergens.length > 0 && (
              <div className="allergen-active-list">
                {allergens.map(a => (
                  <span key={a} className="allergen-active-chip">
                    {a}
                    <button className="allergen-remove" onClick={() => removeAllergen(a)}>x</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
