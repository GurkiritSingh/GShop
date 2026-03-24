import type { DietaryTag } from '../types';
import { DIETARY_LABELS } from '../types';

interface DietaryBarProps {
  active: DietaryTag[];
  onChange: (tags: DietaryTag[]) => void;
}

const ALL_TAGS: DietaryTag[] = ['halal', 'vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'nut_free', 'kosher'];

export function DietaryBar({ active, onChange }: DietaryBarProps) {
  const toggle = (tag: DietaryTag) => {
    onChange(
      active.includes(tag)
        ? active.filter(t => t !== tag)
        : [...active, tag]
    );
  };

  return (
    <div className="dietary-bar">
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
  );
}
