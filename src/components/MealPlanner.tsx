import { useState, useMemo, useEffect } from 'react';
import type { Meal, MealIngredient, DayOfWeek, WeeklyMealPlan, DietaryTag, GroceryCategory } from '../types';
import { DAYS, DAY_LABELS, DIETARY_LABELS, CATEGORY_LABELS } from '../types';
import {
  PRESET_MEALS, getAllMeals, getMealById, loadSavedMeals, saveMeals,
  loadMealPlan, saveMealPlan, emptyMealPlan, mealPlanIngredients, filterMealsByDietary,
} from '../services/mealService';
import { encodeMealPlanToUrl, encodeMealToUrl } from '../services/listSharing';
import { getAvailableItems } from '../services/priceService';

const availableItems = getAvailableItems();

interface MealPlannerProps {
  onAddToShoppingList: (name: string, category: GroceryCategory, quantity: number) => void;
  dietaryFilters: DietaryTag[];
  onDietaryChange: (tags: DietaryTag[]) => void;
  importedMealPlan?: { plan: WeeklyMealPlan; meals: Meal[] } | null;
  importedMeal?: Meal | null;
  onImportConsumed?: () => void;
}

type MealTab = 'planner' | 'meals' | 'dietary';
type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export function MealPlanner({ onAddToShoppingList, dietaryFilters, onDietaryChange, importedMealPlan, importedMeal, onImportConsumed }: MealPlannerProps) {
  const [activeTab, setActiveTab] = useState<MealTab>('planner');
  const [savedMeals, setSavedMeals] = useState<Meal[]>(loadSavedMeals);
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan>(loadMealPlan);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Handle imports from shared URLs
  useEffect(() => {
    if (importedMealPlan) {
      // Merge imported meals into saved meals
      const newMeals = [...savedMeals];
      for (const meal of importedMealPlan.meals) {
        if (!newMeals.find(m => m.id === meal.id)) {
          newMeals.push(meal);
        }
      }
      setSavedMeals(newMeals);
      saveMeals(newMeals);
      setMealPlan(importedMealPlan.plan);
      saveMealPlan(importedMealPlan.plan);
      setActiveTab('planner');
      onImportConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedMealPlan]);

  useEffect(() => {
    if (importedMeal) {
      const newMeals = [...savedMeals, importedMeal];
      setSavedMeals(newMeals);
      saveMeals(newMeals);
      setActiveTab('meals');
      onImportConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedMeal]);
  const [addingTo, setAddingTo] = useState<{ day: DayOfWeek; slot: MealSlot } | null>(null);
  const [showCreateMeal, setShowCreateMeal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Create/edit meal form state
  const [formName, setFormName] = useState('');
  const [formServings, setFormServings] = useState(4);
  const [formTags, setFormTags] = useState<DietaryTag[]>([]);
  const [formIngredients, setFormIngredients] = useState<MealIngredient[]>([]);
  const [ingInput, setIngInput] = useState('');
  const [ingSuggestions, setIngSuggestions] = useState<string[]>([]);
  const [showIngSuggestions, setShowIngSuggestions] = useState(false);
  const [ingCategory, setIngCategory] = useState<GroceryCategory>('other');
  const [ingQty, setIngQty] = useState(1);

  const allMeals = useMemo(() => getAllMeals(savedMeals), [savedMeals]);
  const filteredMeals = useMemo(
    () => filterMealsByDietary(allMeals, dietaryFilters),
    [allMeals, dietaryFilters]
  );

  // ===== Meal Plan actions =====
  const addMealToPlan = (day: DayOfWeek, slot: MealSlot, mealId: string) => {
    const updated = { ...mealPlan };
    updated[day] = [...updated[day], { mealId, slot }];
    setMealPlan(updated);
    saveMealPlan(updated);
    setAddingTo(null);
  };

  const removeMealFromPlan = (day: DayOfWeek, index: number) => {
    const updated = { ...mealPlan };
    updated[day] = updated[day].filter((_, i) => i !== index);
    setMealPlan(updated);
    saveMealPlan(updated);
  };

  const clearPlan = () => {
    const empty = emptyMealPlan();
    setMealPlan(empty);
    saveMealPlan(empty);
  };

  const addPlanToShoppingList = () => {
    const ingredients = mealPlanIngredients(mealPlan, savedMeals);
    for (const ing of ingredients) {
      onAddToShoppingList(ing.name, ing.category, ing.quantity);
    }
  };

  const planHasEntries = DAYS.some(d => mealPlan[d].length > 0);

  // ===== Share actions =====
  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      prompt('Copy this link to share:', url);
    }
  };

  const handleSharePlan = () => {
    const url = encodeMealPlanToUrl('Meal Plan', mealPlan, allMeals, dietaryFilters);
    copyToClipboard(url, 'plan');
  };

  const handleShareMeal = (meal: Meal) => {
    const url = encodeMealToUrl(meal);
    copyToClipboard(url, meal.id);
  };

  // ===== Saved Meals actions =====
  const deleteSavedMeal = (id: string) => {
    const updated = savedMeals.filter(m => m.id !== id);
    setSavedMeals(updated);
    saveMeals(updated);
  };

  const addMealIngredientsToList = (meal: Meal) => {
    for (const ing of meal.ingredients) {
      onAddToShoppingList(ing.name, ing.category, ing.quantity);
    }
  };

  // ===== Create/Edit meal =====
  const resetForm = () => {
    setFormName('');
    setFormServings(4);
    setFormTags([]);
    setFormIngredients([]);
    setIngInput('');
    setIngCategory('other');
    setIngQty(1);
    setEditingMeal(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowCreateMeal(true);
  };

  const openEditForm = (meal: Meal) => {
    setFormName(meal.name);
    setFormServings(meal.servings);
    setFormTags([...meal.tags]);
    setFormIngredients([...meal.ingredients]);
    setEditingMeal(meal);
    setShowCreateMeal(true);
  };

  const closeForm = () => {
    resetForm();
    setShowCreateMeal(false);
  };

  const handleIngInputChange = (value: string) => {
    setIngInput(value);
    if (value.trim().length > 0) {
      const filtered = availableItems.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setIngSuggestions(filtered.slice(0, 6));
      setShowIngSuggestions(filtered.length > 0);
    } else {
      setIngSuggestions([]);
      setShowIngSuggestions(false);
    }
  };

  const addIngredient = (name?: string) => {
    const itemName = (name || ingInput).trim();
    if (!itemName) return;
    // Check if already in list
    const existing = formIngredients.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (existing) {
      setFormIngredients(formIngredients.map(i =>
        i.name.toLowerCase() === itemName.toLowerCase()
          ? { ...i, quantity: i.quantity + ingQty }
          : i
      ));
    } else {
      setFormIngredients([...formIngredients, { name: itemName, quantity: ingQty, category: ingCategory }]);
    }
    setIngInput('');
    setIngSuggestions([]);
    setShowIngSuggestions(false);
    setIngQty(1);
  };

  const removeIngredient = (index: number) => {
    setFormIngredients(formIngredients.filter((_, i) => i !== index));
  };

  const updateIngQty = (index: number, qty: number) => {
    setFormIngredients(formIngredients.map((ing, i) =>
      i === index ? { ...ing, quantity: Math.max(1, qty) } : ing
    ));
  };

  const toggleFormTag = (tag: DietaryTag) => {
    setFormTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveMeal = () => {
    if (!formName.trim() || formIngredients.length === 0) return;

    if (editingMeal) {
      // Update existing
      const updated = savedMeals.map(m =>
        m.id === editingMeal.id
          ? { ...m, name: formName.trim(), servings: formServings, tags: formTags, ingredients: formIngredients }
          : m
      );
      setSavedMeals(updated);
      saveMeals(updated);
    } else {
      // Create new
      const meal: Meal = {
        id: `custom-${Date.now()}`,
        name: formName.trim(),
        servings: formServings,
        tags: formTags,
        ingredients: formIngredients,
      };
      const updated = [...savedMeals, meal];
      setSavedMeals(updated);
      saveMeals(updated);
    }
    closeForm();
  };

  // ===== Dietary filter actions =====
  const toggleDietary = (tag: DietaryTag) => {
    const next = dietaryFilters.includes(tag)
      ? dietaryFilters.filter(t => t !== tag)
      : [...dietaryFilters, tag];
    onDietaryChange(next);
  };

  return (
    <div className="meal-planner">
      {/* Sub-tabs */}
      <div className="meal-tabs">
        {([['planner', 'Week Planner'], ['meals', 'Saved Meals'], ['dietary', 'Dietary']] as [MealTab, string][]).map(([key, label]) => (
          <button
            key={key}
            className={`meal-tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ===== PLANNER TAB ===== */}
      {activeTab === 'planner' && (
        <div className="planner-view">
          <div className="planner-header">
            <h3>Weekly Meal Plan</h3>
            <div className="planner-actions">
              {planHasEntries && (
                <>
                  <button className="btn-plan-action green" onClick={addPlanToShoppingList}>
                    Add All to List
                  </button>
                  <button className="btn-plan-action share" onClick={() => handleSharePlan()}>
                    {copiedId === 'plan' ? 'Copied!' : 'Share'}
                  </button>
                  <button className="btn-plan-action red" onClick={clearPlan}>
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="week-grid">
            {DAYS.map(day => (
              <div key={day} className="day-column">
                <div className="day-header">{DAY_LABELS[day]}</div>
                <div className="day-meals">
                  {mealPlan[day].map((entry, i) => {
                    const meal = getMealById(entry.mealId, savedMeals);
                    return (
                      <div key={i} className="day-meal-card">
                        <span className="day-meal-slot">{entry.slot}</span>
                        <span className="day-meal-name">{meal?.name || 'Unknown'}</span>
                        <button
                          className="day-meal-remove"
                          onClick={() => removeMealFromPlan(day, i)}
                        >
                          x
                        </button>
                      </div>
                    );
                  })}
                  <button
                    className="btn-add-meal-to-day"
                    onClick={() => setAddingTo(addingTo?.day === day ? null : { day, slot: 'dinner' })}
                  >
                    + Add meal
                  </button>

                  {addingTo?.day === day && (
                    <div className="meal-picker">
                      <div className="meal-picker-slots">
                        {(['breakfast', 'lunch', 'dinner'] as MealSlot[]).map(s => (
                          <button
                            key={s}
                            className={`slot-btn ${addingTo.slot === s ? 'active' : ''}`}
                            onClick={() => setAddingTo({ ...addingTo, slot: s })}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <div className="meal-picker-list">
                        {filteredMeals.map(meal => (
                          <button
                            key={meal.id}
                            className="meal-picker-item"
                            onClick={() => addMealToPlan(day, addingTo.slot, meal.id)}
                          >
                            {meal.name}
                            <span className="meal-picker-servings">{meal.servings} servings</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== SAVED MEALS TAB ===== */}
      {activeTab === 'meals' && (
        <div className="meals-view">
          <div className="meals-header">
            <h3>{showCreateMeal ? (editingMeal ? 'Edit Meal' : 'Create New Meal') : 'Your Meals'}</h3>
            {!showCreateMeal && (
              <button className="btn-plan-action green" onClick={openCreateForm}>
                + New Meal
              </button>
            )}
          </div>

          {showCreateMeal && (
            <div className="create-meal-form">
              {/* Meal name */}
              <div className="form-field">
                <label className="form-label">Meal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shepherd's Pie"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                />
              </div>

              {/* Servings */}
              <div className="form-field">
                <label className="form-label">Servings</label>
                <div className="servings-row">
                  <button className="qty-btn" onClick={() => setFormServings(Math.max(1, formServings - 1))}>-</button>
                  <span className="servings-display">{formServings}</span>
                  <button className="qty-btn" onClick={() => setFormServings(formServings + 1)}>+</button>
                </div>
              </div>

              {/* Ingredients */}
              <div className="form-field">
                <label className="form-label">Ingredients</label>
                <div className="ing-add-row">
                  <div className="ing-input-wrapper">
                    <input
                      type="text"
                      placeholder="Type an ingredient..."
                      value={ingInput}
                      onChange={e => handleIngInputChange(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addIngredient(); }}
                      onBlur={() => setTimeout(() => setShowIngSuggestions(false), 200)}
                      onFocus={() => { if (ingSuggestions.length > 0) setShowIngSuggestions(true); }}
                    />
                    {showIngSuggestions && (
                      <div className="suggestions">
                        {ingSuggestions.map(s => (
                          <button
                            key={s}
                            className="suggestion-item"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => addIngredient(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <select value={ingCategory} onChange={e => setIngCategory(e.target.value as GroceryCategory)}>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <div className="ing-qty-group">
                    <button className="qty-btn" onClick={() => setIngQty(Math.max(1, ingQty - 1))}>-</button>
                    <span className="qty-display">{ingQty}</span>
                    <button className="qty-btn" onClick={() => setIngQty(ingQty + 1)}>+</button>
                  </div>
                  <button className="btn-add" onClick={() => addIngredient()}>Add</button>
                </div>

                {/* Ingredient list */}
                {formIngredients.length > 0 && (
                  <div className="form-ingredients-list">
                    {formIngredients.map((ing, i) => (
                      <div key={i} className="form-ingredient-item">
                        <span className="form-ing-name">{ing.name}</span>
                        <span className="form-ing-cat">{CATEGORY_LABELS[ing.category]}</span>
                        <div className="form-ing-qty">
                          <button className="qty-btn-sm" onClick={() => updateIngQty(i, ing.quantity - 1)}>-</button>
                          <span>{ing.quantity}</span>
                          <button className="qty-btn-sm" onClick={() => updateIngQty(i, ing.quantity + 1)}>+</button>
                        </div>
                        <button className="btn-remove-sm" onClick={() => removeIngredient(i)}>x</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dietary tags */}
              <div className="form-field">
                <label className="form-label">Dietary Tags (optional)</label>
                <div className="form-dietary-chips">
                  {(Object.entries(DIETARY_LABELS) as [DietaryTag, { label: string; icon: string }][]).map(
                    ([tag, { label, icon }]) => (
                      <button
                        key={tag}
                        className={`category-chip ${formTags.includes(tag) ? 'active' : ''}`}
                        onClick={() => toggleFormTag(tag)}
                        type="button"
                      >
                        {icon} {label}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button
                  className="btn-plan-action green"
                  onClick={handleSaveMeal}
                  disabled={!formName.trim() || formIngredients.length === 0}
                >
                  {editingMeal ? 'Save Changes' : 'Create Meal'}
                </button>
                <button className="btn-plan-action" onClick={closeForm}>Cancel</button>
              </div>
            </div>
          )}

          {!showCreateMeal && (
            <div className="meal-cards">
              {filteredMeals.map(meal => {
                const isCustom = !PRESET_MEALS.find(p => p.id === meal.id);
                return (
                  <div key={meal.id} className="meal-card">
                    <div className="meal-card-header">
                      <h4>{meal.name}</h4>
                      {isCustom && <span className="meal-badge custom">Custom</span>}
                    </div>
                    <div className="meal-card-meta">
                      <span>{meal.servings} servings</span>
                      <span>&middot;</span>
                      <span>{meal.ingredients.length} ingredients</span>
                    </div>
                    {meal.tags.length > 0 && (
                      <div className="meal-card-tags">
                        {meal.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="dietary-badge">
                            {DIETARY_LABELS[tag].icon} {DIETARY_LABELS[tag].label}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="meal-card-ingredients">
                      {meal.ingredients.map((ing, i) => (
                        <span key={i} className="ingredient-chip">
                          {ing.quantity > 1 ? `${ing.quantity}x ` : ''}{ing.name}
                        </span>
                      ))}
                    </div>
                    <div className="meal-card-actions">
                      <button
                        className="btn-meal-action"
                        onClick={() => addMealIngredientsToList(meal)}
                      >
                        Add to List
                      </button>
                      <button
                        className="btn-meal-action share"
                        onClick={() => handleShareMeal(meal)}
                      >
                        {copiedId === meal.id ? 'Copied!' : 'Share'}
                      </button>
                      {isCustom && (
                        <>
                          <button
                            className="btn-meal-action"
                            onClick={() => openEditForm(meal)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-meal-action danger"
                            onClick={() => deleteSavedMeal(meal.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== DIETARY TAB ===== */}
      {activeTab === 'dietary' && (
        <div className="dietary-view">
          <h3>Dietary Preferences</h3>
          <p className="dietary-desc">
            Select your dietary requirements. Meals and suggestions will be filtered accordingly.
          </p>
          <div className="dietary-grid">
            {(Object.entries(DIETARY_LABELS) as [DietaryTag, { label: string; icon: string }][]).map(
              ([tag, { label, icon }]) => (
                <button
                  key={tag}
                  className={`dietary-card ${dietaryFilters.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleDietary(tag)}
                >
                  <span className="dietary-card-icon">{icon}</span>
                  <span className="dietary-card-label">{label}</span>
                </button>
              )
            )}
          </div>
          {dietaryFilters.length > 0 && (
            <button
              className="btn-plan-action red"
              style={{ marginTop: 12 }}
              onClick={() => onDietaryChange([])}
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
