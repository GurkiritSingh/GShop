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
import { AccountPanel } from './components/AccountPanel';
import { AIAssistant } from './components/AIAssistant';
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

type AppTab = 'list' | 'results' | 'meals' | 'saved' | 'prices' | 'ai';

const NAV_ITEMS: { id: AppTab; label: string; icon: string }[] = [
  { id: 'list', label: 'List', icon: 'list_alt' },
  { id: 'ai', label: 'AI', icon: 'smart_toy' },
  { id: 'results', label: 'Stores', icon: 'storefront' },
  { id: 'meals', label: 'Meals', icon: 'restaurant' },
  { id: 'saved', label: 'Saved', icon: 'bookmark' },
  { id: 'prices', label: 'Prices', icon: 'payments' },
];

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
  const [allergens, setAllergens] = useState<string[]>(() => {
    try { const d = localStorage.getItem('gshop-allergens'); return d ? JSON.parse(d) : []; }
    catch { return []; }
  });
  const [importBanner, setImportBanner] = useState<string | null>(null);
  const [showAccount, setShowAccount] = useState(false);
  const [importedMealPlan, setImportedMealPlan] = useState<{ plan: WeeklyMealPlan; meals: Meal[] } | null>(null);
  const [importedMeal, setImportedMeal] = useState<Meal | null>(null);

  const handleDietaryChange = (tags: DietaryTag[]) => {
    setDietaryFilters(tags);
    localStorage.setItem(DIETARY_STORAGE_KEY, JSON.stringify(tags));
  };

  const handleAllergensChange = (newAllergens: string[]) => {
    setAllergens(newAllergens);
    localStorage.setItem('gshop-allergens', JSON.stringify(newAllergens));
  };

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

  const handleCloudDataLoaded = (data: { shoppingList?: ShoppingItem[]; dietaryFilters?: DietaryTag[] }) => {
    if (data.shoppingList) replaceList(data.shoppingList);
    if (data.dietaryFilters) handleDietaryChange(data.dietaryFilters);
    addNotification('Data loaded from cloud', 'success');
  };

  const [_cloudSyncing, setCloudSyncing] = useState(false);

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

  useEffect(() => { fetchStores(); }, [fetchStores]);

  useEffect(() => {
    if (items.length > 0 && stores.length > 0) {
      setRecommendations(getRecommendations(items, stores));
    } else {
      setRecommendations([]);
    }
  }, [items, stores]);

  const handleCompare = () => {
    if (items.length === 0) { alert('Add some items to your shopping list first!'); return; }
    if (!location || (location.lat === 0 && location.lon === 0)) { alert('Please set your location first!'); return; }
    setActiveTab('results');
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-background text-on-background antialiased">
      {/* Top app bar */}
      <header className="fixed top-0 w-full z-40 bg-background/70 backdrop-blur-xl shadow-sm h-16 flex justify-between items-center px-4 md:px-6 md:pl-72 border-b border-outline-variant/20">
        <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-primary md:hidden">GShop</h1>
          <div className="hidden md:flex items-center bg-surface-container-highest px-4 py-2 rounded-xl w-full max-w-md gap-3">
            <span className="material-symbols-outlined text-outline">search</span>
            <input
              type="text"
              placeholder="Search for ingredients or stores..."
              className="bg-transparent border-none focus:outline-none text-sm w-full text-on-surface placeholder:text-outline"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={markAllRead}
            onClearAll={clearNotifications}
            onRequestPermission={requestPermission}
          />
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button
            onClick={() => setShowAccount(!showAccount)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition"
          >
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </header>

      {/* Desktop side nav — hidden on mobile */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 z-50 bg-surface-container-low flex-col p-4 gap-2 pt-20 border-r border-outline-variant/20">
        <div className="px-4 py-4 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-on-primary-container font-black text-lg shadow-md">G</div>
          <div>
            <h2 className="text-xl font-black italic tracking-tighter text-primary leading-none">GShop</h2>
            <p className="text-[9px] uppercase tracking-widest font-bold text-outline mt-1">Hits the right spot</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-tight transition-transform hover:scale-[1.02] active:scale-95 ${
                  active
                    ? 'bg-surface-container-highest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setShowAccount(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-tight text-on-surface-variant hover:bg-surface-container-high transition-transform hover:scale-[1.02] active:scale-95"
          >
            <span className="material-symbols-outlined">person</span>
            <span>Account</span>
          </button>
        </nav>
        {/* Footer section */}
        <div className="flex flex-col gap-1 pt-4 border-t border-outline-variant/20">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-tight text-on-surface-variant hover:bg-surface-container-high transition-transform hover:scale-[1.02] active:scale-95"
          >
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <a
            href="https://github.com/GurkiritSingh/GShop"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-tight text-on-surface-variant hover:bg-surface-container-high transition-transform hover:scale-[1.02] active:scale-95"
          >
            <span className="material-symbols-outlined">help_outline</span>
            <span>Help</span>
          </a>
        </div>
        <div className="text-[10px] text-outline px-4 py-2">
          Prices from OpenStreetMap
        </div>
      </aside>

      {/* Account drawer */}
      {showAccount && (
        <div className="fixed top-20 right-4 z-40 bg-surface-container rounded-2xl shadow-2xl p-4 max-w-sm w-[calc(100%-2rem)] border border-outline-variant/20">
          <button onClick={() => setShowAccount(false)} className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container-high">&times;</button>
          <AccountPanel
            shoppingList={items}
            dietaryFilters={dietaryFilters}
            onCloudDataLoaded={handleCloudDataLoaded}
            onSyncStatusChange={setCloudSyncing}
          />
        </div>
      )}

      {/* Import banner */}
      {importBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-emerald-500 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-3">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-semibold text-sm">{importBanner}</span>
          <button onClick={() => setImportBanner(null)} className="ml-2 opacity-80 hover:opacity-100">&times;</button>
        </div>
      )}

      {/* Main content — shifted right on desktop to clear the side nav */}
      <main className="pt-20 pb-10 px-4 md:pl-72 md:pr-8 max-w-full xl:max-w-[1400px] mx-auto">
        {activeTab === 'list' && (
          <div className="space-y-6">
            <DietaryBar active={dietaryFilters} onChange={handleDietaryChange} allergens={allergens} onAllergensChange={handleAllergensChange} />
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
              allergens={allergens}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              onUpdateQuantity={updateQuantity}
              onClearList={clearList}
            />
            <ListExport items={items} dietary={dietaryFilters} />
            {items.length > 0 && location && location.lat !== 0 && (
              <button
                onClick={handleCompare}
                className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-[0px_12px_32px_rgba(0,76,34,0.3)] hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">storefront</span>
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

        {activeTab === 'ai' && (
          <AIAssistant
            onAddToShoppingList={addItem}
            dietaryFilters={dietaryFilters}
            allergens={allergens}
          />
        )}

        {activeTab === 'prices' && <PriceEditor />}

        {activeTab === 'results' && (
          <div className="space-y-6">
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

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden w-full bg-surface-container-low/90 backdrop-blur-xl shadow-[0px_-8px_24px_rgba(0,0,0,0.08)] rounded-t-[1.5rem] pb-safe mt-8 border-t border-outline-variant/20">
        <div className="flex justify-around items-center px-2 py-2 max-w-2xl mx-auto">
          {NAV_ITEMS.map(({ id, label, icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-150 active:scale-90 ${
                  active
                    ? 'bg-secondary-container text-on-secondary-container h-14 w-14'
                    : 'text-outline hover:text-primary'
                }`}
                aria-label={label}
              >
                <span className="material-symbols-outlined">{icon}</span>
                {!active && <span className="text-[10px] font-medium uppercase tracking-widest mt-0.5">{label}</span>}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
