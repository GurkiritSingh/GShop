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

const NAV_ITEMS: { id: AppTab; label: string; icon: string }[] = [
  { id: 'list', label: 'List', icon: 'list_alt' },
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
  const bgBase = isDark ? 'bg-[#020617] text-[#f8f9ff]' : 'bg-surface text-on-surface';
  const headerBg = isDark ? 'bg-slate-900/70' : 'bg-[#f8f9ff]/70';
  const sideBg = isDark ? 'bg-slate-900' : 'bg-[#eef4ff]';
  const navBg = isDark ? 'bg-slate-900/80' : 'bg-white/70';
  const inactiveIcon = isDark ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`min-h-screen ${bgBase} antialiased`}>
      {/* Top app bar */}
      <header className={`fixed top-0 w-full z-40 ${headerBg} backdrop-blur-xl shadow-sm h-16 flex justify-between items-center px-4 md:px-6 md:pl-72`}>
        <div className="flex items-center gap-4 md:gap-8">
          <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-[#166534] dark:text-emerald-300">GShop</h1>
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
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#166534] dark:text-emerald-300 hover:bg-black/5 dark:hover:bg-white/10 transition"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button
            onClick={() => setShowAccount(!showAccount)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#166534] dark:text-emerald-300 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </header>

      {/* Desktop side nav — hidden on mobile */}
      <aside className={`hidden md:flex fixed left-0 top-0 h-full w-64 z-50 ${sideBg} flex-col p-4 gap-2 pt-20`}>
        <div className="px-4 py-2 mb-4">
          <h2 className="text-lg font-black text-[#166534] dark:text-emerald-300 leading-tight">The Culinary Curator</h2>
          <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#151c25]/60 dark:text-white/60 mt-1">Premium Groceries</p>
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
                    ? 'bg-white dark:bg-slate-800 text-[#166534] dark:text-emerald-300 shadow-sm'
                    : 'text-[#151c25]/70 dark:text-white/70 hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setShowAccount(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-tight text-[#151c25]/70 dark:text-white/70 hover:bg-white/50 dark:hover:bg-white/5 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <span className="material-symbols-outlined">person</span>
            <span>Account</span>
          </button>
        </nav>
        <div className="text-[10px] text-[#151c25]/40 dark:text-white/40 px-4 py-2 border-t border-black/5 dark:border-white/5">
          Prices from OpenStreetMap
        </div>
      </aside>

      {/* Account drawer */}
      {showAccount && (
        <div className="fixed top-20 right-4 z-40 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 max-w-sm w-[calc(100%-2rem)] border border-slate-200 dark:border-slate-700">
          <button onClick={() => setShowAccount(false)} className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">&times;</button>
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
      <nav className={`md:hidden w-full ${navBg} backdrop-blur-xl shadow-[0px_-8px_24px_rgba(21,28,37,0.04)] rounded-t-[1.5rem] pb-safe mt-8`}>
        <div className="flex justify-around items-center px-2 py-2 max-w-2xl mx-auto">
          {NAV_ITEMS.map(({ id, label, icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-150 active:scale-90 ${
                  active
                    ? 'bg-lime-400 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-50 h-14 w-14'
                    : `${inactiveIcon} hover:text-emerald-600`
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
