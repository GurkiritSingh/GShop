import { useState, useEffect, useCallback } from 'react';
import { ShoppingList } from './components/ShoppingList';
import { LocationPicker } from './components/LocationPicker';
import { StoreResults } from './components/StoreResults';
import { StoreMap } from './components/StoreMap';
import { MealPlanner } from './components/MealPlanner';
import { DietaryBar } from './components/DietaryBar';
import { SavedLists } from './components/SavedLists';
import { PriceEditor } from './components/PriceEditor';
import { BudgetTracker } from './components/BudgetTracker';
import { ListExport } from './components/ListExport';
import { NotificationBell } from './components/NotificationBell';
import { useShoppingList } from './hooks/useShoppingList';
import { useLocation } from './hooks/useLocation';
import { useTheme } from './hooks/useTheme';
import { useNotifications } from './hooks/useNotifications';
import { findNearbyStores } from './services/storeLocator';
import { getRecommendations } from './services/recommendations';
import { decodeFromCurrentUrl } from './services/listSharing';
import { SUPERMARKET_INFO } from './types';
import type { ShoppingItem, Meal, NearbyStore, StoreRecommendation, DietaryTag, GroceryCategory, WeeklyMealPlan } from './types';
import './App.css';

const DIETARY_STORAGE_KEY = 'gshop-dietary-filters';

function loadDietaryFilters(): DietaryTag[] {
  try {
    const data = localStorage.getItem(DIETARY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

type AppTab = 'list' | 'results' | 'meals' | 'saved' | 'prices';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { items, addItem, removeItem, updateQuantity, clearList, replaceList } = useShoppingList();
  const { notifications, unreadCount, addNotification, markAllRead, clearAll: clearNotifications, requestPermission } = useNotifications();
  const { location, loading: locationLoading, error: locationError, requestLocation, setManualLocation, clearLocation } = useLocation();

  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [recommendations, setRecommendations] = useState<StoreRecommendation[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storesError, setStoresError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [activeTab, setActiveTab] = useState<AppTab>('list');
  const [dietaryFilters, setDietaryFilters] = useState<DietaryTag[]>(loadDietaryFilters);
  const [importBanner, setImportBanner] = useState<string | null>(null);
  // Callbacks from MealPlanner for shared imports
  const [importedMealPlan, setImportedMealPlan] = useState<{ plan: WeeklyMealPlan; meals: Meal[] } | null>(null);
  const [importedMeal, setImportedMeal] = useState<Meal | null>(null);

  const handleDietaryChange = (tags: DietaryTag[]) => {
    setDietaryFilters(tags);
    localStorage.setItem(DIETARY_STORAGE_KEY, JSON.stringify(tags));
  };

  // Check URL for shared data on load
  useEffect(() => {
    const shared = decodeFromCurrentUrl();
    if (!shared) return;

    window.history.replaceState({}, '', window.location.pathname);

    if (shared.type === 'list') {
      replaceList(shared.items);
      if (shared.dietary.length > 0) handleDietaryChange(shared.dietary);
      const msg = `Imported list "${shared.name}" (${shared.items.length} items)`;
      setImportBanner(msg);
      addNotification(msg, 'success');
      setActiveTab('list');
    } else if (shared.type === 'mealplan') {
      setImportedMealPlan({ plan: shared.plan, meals: shared.meals });
      if (shared.dietary.length > 0) handleDietaryChange(shared.dietary);
      const msg = `Imported meal plan "${shared.name}"`;
      setImportBanner(msg);
      addNotification(msg, 'success');
      setActiveTab('meals');
    } else if (shared.type === 'meal') {
      setImportedMeal(shared.meal);
      const msg = `Imported meal "${shared.meal.name}"`;
      setImportBanner(msg);
      addNotification(msg, 'success');
      setActiveTab('meals');
    }

    setTimeout(() => setImportBanner(null), 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadList = (listItems: ShoppingItem[], dietary: DietaryTag[]) => {
    replaceList(listItems);
    handleDietaryChange(dietary);
    setActiveTab('list');
  };

  const fetchStores = useCallback(async (radius?: number) => {
    if (!location || (location.lat === 0 && location.lon === 0)) return;

    const r = radius ?? searchRadius;
    setStoresLoading(true);
    setStoresError(null);

    try {
      const nearbyStores = await findNearbyStores(location, r);
      setStores(nearbyStores);

      if (nearbyStores.length === 0) {
        setStoresError(`No supermarkets found within ${r}km. Try expanding the search or a different location.`);
      }
    } catch (err) {
      console.error('Store fetch error:', err);
      setStoresError('Failed to find nearby stores. The map service may be busy — please try again in a moment.');
    } finally {
      setStoresLoading(false);
    }
  }, [location, searchRadius]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    if (items.length > 0 && stores.length > 0) {
      const recs = getRecommendations(items, stores);
      setRecommendations(recs);
    } else {
      setRecommendations([]);
    }
  }, [items, stores]);

  const handleCompare = () => {
    if (items.length === 0) {
      alert('Add some items to your shopping list first!');
      return;
    }
    if (!location || (location.lat === 0 && location.lon === 0)) {
      alert('Please set your location first!');
      return;
    }
    setActiveTab('results');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-logo">
            <span className="logo-text">GShop</span>
          </div>
          <p className="tagline">Find the cheapest supermarket for your shopping list</p>
          <div className="header-actions">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={markAllRead}
              onClearAll={clearNotifications}
              onRequestPermission={requestPermission}
            />
            <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? '\uD83C\uDF19' : '\u2600\uFE0F'}
            </button>
          </div>
        </div>
      </header>

      {importBanner && (
        <div className="import-banner">
          {importBanner}
          <button onClick={() => setImportBanner(null)}>x</button>
        </div>
      )}

      <main className="app-main">
        <div className="tab-bar">
          <button className={`tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
            List ({items.length})
          </button>
          <button className={`tab ${activeTab === 'meals' ? 'active' : ''}`} onClick={() => setActiveTab('meals')}>
            Meals
          </button>
          <button className={`tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
            Saved
          </button>
          <button className={`tab ${activeTab === 'prices' ? 'active' : ''}`} onClick={() => setActiveTab('prices')}>
            Prices
          </button>
          <button className={`tab ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>
            Results
          </button>
        </div>

        {activeTab === 'list' && (
          <div className="list-view">
            <DietaryBar active={dietaryFilters} onChange={handleDietaryChange} />

            <LocationPicker
              location={location}
              loading={locationLoading}
              error={locationError}
              onRequestLocation={requestLocation}
              onManualLocation={setManualLocation}
              onClearLocation={clearLocation}
            />

            <ShoppingList
              items={items}
              dietaryFilters={dietaryFilters}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              onUpdateQuantity={updateQuantity}
              onClearList={clearList}
            />

            <ListExport items={items} dietary={dietaryFilters} />

            {items.length > 0 && location && location.lat !== 0 && (
              <button className="btn-compare" onClick={handleCompare}>
                Compare Prices at Nearby Stores
              </button>
            )}
          </div>
        )}

        {activeTab === 'meals' && (
          <MealPlanner
            onAddToShoppingList={addItem}
            dietaryFilters={dietaryFilters}
            onDietaryChange={handleDietaryChange}
            importedMealPlan={importedMealPlan}
            importedMeal={importedMeal}
            onImportConsumed={() => { setImportedMealPlan(null); setImportedMeal(null); }}
          />
        )}

        {activeTab === 'saved' && (
          <SavedLists
            currentItems={items}
            currentDietary={dietaryFilters}
            onLoadList={handleLoadList}
            onAddToList={(name: string, category: GroceryCategory, quantity: number) => addItem(name, category, quantity)}
          />
        )}

        {activeTab === 'prices' && (
          <PriceEditor />
        )}

        {activeTab === 'results' && (
          <div className="results-view">
            {recommendations.length > 0 && (
              <BudgetTracker
                estimatedTotal={recommendations[0]?.pricing.totalPrice}
                storeName={recommendations[0] ? SUPERMARKET_INFO[recommendations[0].store.brand].name : undefined}
              />
            )}

            <StoreResults
              recommendations={recommendations}
              loading={storesLoading}
              error={storesError}
              onRetry={() => fetchStores()}
              onExpandSearch={() => {
                setSearchRadius(15);
                fetchStores(15);
              }}
            />

            {location && location.lat !== 0 && recommendations.length > 0 && (
              <StoreMap location={location} recommendations={recommendations} />
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Prices are estimates and may vary. Store locations from OpenStreetMap.
        </p>
      </footer>
    </div>
  );
}

export default App;
