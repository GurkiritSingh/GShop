import { useState, useMemo } from 'react';
import type { StoreRecommendation, SupermarketBrand, PriceResult } from '../types';
import { SUPERMARKET_INFO } from '../types';
import { formatPrice, formatDistance } from '../services/recommendations';
import { getProductSearchUrl } from '../services/storeLinks';

type SortMode = 'best' | 'cheapest' | 'closest' | 'coverage';

const STORE_CATEGORIES: Record<string, { label: string; brands: SupermarketBrand[] }> = {
  big4:        { label: 'Big 4',        brands: ['tesco', 'asda', 'sainsburys', 'morrisons'] },
  discount:    { label: 'Discounters',  brands: ['aldi', 'lidl'] },
  premium:     { label: 'Premium',      brands: ['waitrose', 'marks_spencer'] },
  coop:        { label: 'Co-op',        brands: ['coop'] },
  frozen:      { label: 'Frozen/Value', brands: ['iceland', 'farmfoods', 'heron_foods'] },
  variety:     { label: 'Variety',      brands: ['home_bargains', 'bm', 'poundland'] },
  convenience: { label: 'Convenience',  brands: ['spar', 'costcutter', 'nisa', 'londis', 'budgens'] },
  online:      { label: 'Online/Bulk',  brands: ['ocado', 'amazon_fresh', 'costco'] },
};

interface StoreResultsProps {
  recommendations: StoreRecommendation[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onExpandSearch?: () => void;
}

export function StoreResults({ recommendations, loading, error, onRetry, onExpandSearch }: StoreResultsProps) {
  const [sortMode, setSortMode] = useState<SortMode>('best');
  const [maxDistance, setMaxDistance] = useState<number>(15);
  const [enabledCategories, setEnabledCategories] = useState<Set<string>>(
    () => new Set(Object.keys(STORE_CATEGORIES))
  );
  const [onlyFullCoverage, setOnlyFullCoverage] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const enabledBrands = useMemo(() => {
    const brands = new Set<SupermarketBrand>();
    for (const [catKey, cat] of Object.entries(STORE_CATEGORIES)) {
      if (enabledCategories.has(catKey)) {
        for (const b of cat.brands) brands.add(b);
      }
    }
    return brands;
  }, [enabledCategories]);

  const filtered = useMemo(() => {
    let results = recommendations.filter((rec) => {
      if (!enabledBrands.has(rec.store.brand)) return false;
      if (rec.store.distance > maxDistance) return false;
      if (onlyFullCoverage && rec.pricing.itemsFound < rec.pricing.itemsTotal) return false;
      return true;
    });

    const sorted = [...results];
    switch (sortMode) {
      case 'cheapest':
        sorted.sort((a, b) => a.pricing.totalPrice - b.pricing.totalPrice);
        break;
      case 'closest':
        sorted.sort((a, b) => a.store.distance - b.store.distance);
        break;
      case 'coverage':
        sorted.sort((a, b) => {
          const covDiff = b.pricing.itemsFound - a.pricing.itemsFound;
          if (covDiff !== 0) return covDiff;
          return a.pricing.totalPrice - b.pricing.totalPrice;
        });
        break;
      case 'best':
      default:
        sorted.sort((a, b) => a.score - b.score);
        break;
    }
    return sorted;
  }, [recommendations, sortMode, maxDistance, enabledBrands, onlyFullCoverage]);

  const toggleCategory = (key: string) => {
    setEnabledCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectOnlyCategory = (key: string) => {
    setEnabledCategories(new Set([key]));
  };

  const selectAllCategories = () => {
    setEnabledCategories(new Set(Object.keys(STORE_CATEGORIES)));
  };

  if (loading) {
    return (
      <div className="store-results">
        <h2>Finding Best Stores...</h2>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Searching for nearby supermarkets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="store-results">
        <h2>Results</h2>
        <div className="error-message">
          <p>{error}</p>
          <div className="error-actions">
            {onRetry && <button className="btn-retry" onClick={onRetry}>Retry</button>}
            {onExpandSearch && <button className="btn-retry" onClick={onExpandSearch}>Search wider area (15km)</button>}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="store-results">
        <h2>Results</h2>
        <div className="no-results">
          <p>Add items to your list and set your location to see recommendations.</p>
        </div>
      </div>
    );
  }

  const bestStore = filtered[0];
  const cheapestPrice = filtered.length > 0
    ? Math.min(...filtered.map((r) => r.pricing.totalPrice))
    : 0;

  const renderPriceItem = (item: PriceResult, brand: SupermarketBrand, index: number) => {
    const url = getProductSearchUrl(brand, item.productName);
    return (
      <div key={index} className="price-item">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="price-item-link">
            {item.productName}
            <span className="link-icon">&#x2197;</span>
          </a>
        ) : (
          <span className="price-item-name">{item.productName}</span>
        )}
        <span className="price-item-price">{formatPrice(item.price)}</span>
      </div>
    );
  };

  return (
    <div className="store-results">
      <h2>Best Stores For Your List</h2>

      {/* ===== Sort Bar ===== */}
      <div className="sort-bar">
        <span className="sort-label">Sort by:</span>
        {([
          ['best', 'Best Overall'],
          ['cheapest', 'Cheapest'],
          ['closest', 'Nearest'],
          ['coverage', 'Most Items'],
        ] as [SortMode, string][]).map(([mode, label]) => (
          <button
            key={mode}
            className={`sort-btn ${sortMode === mode ? 'active' : ''}`}
            onClick={() => setSortMode(mode)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ===== Filter Toggle ===== */}
      <button
        className="filter-toggle"
        onClick={() => setShowFilters(!showFilters)}
      >
        {showFilters ? 'Hide Filters' : 'Filters'}
        <span className="filter-count">
          {recommendations.length - filtered.length > 0
            ? ` (${recommendations.length - filtered.length} hidden)`
            : ''}
        </span>
      </button>

      {/* ===== Filter Panel ===== */}
      {showFilters && (
        <div className="filter-panel">
          {/* Distance */}
          <div className="filter-group">
            <label className="filter-group-label">
              Max distance: <strong>{maxDistance}km</strong>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="distance-slider"
            />
            <div className="slider-labels">
              <span>1km</span>
              <span>20km</span>
            </div>
          </div>

          {/* Store categories */}
          <div className="filter-group">
            <div className="filter-group-header">
              <label className="filter-group-label">Store types:</label>
              <button className="filter-select-all" onClick={selectAllCategories}>
                Select all
              </button>
            </div>
            <div className="category-filters">
              {Object.entries(STORE_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  className={`category-chip ${enabledCategories.has(key) ? 'active' : ''}`}
                  onClick={() => toggleCategory(key)}
                  onDoubleClick={() => selectOnlyCategory(key)}
                  title="Click to toggle, double-click to show only this"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Coverage toggle */}
          <div className="filter-group">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={onlyFullCoverage}
                onChange={(e) => setOnlyFullCoverage(e.target.checked)}
              />
              Only show stores with all items
            </label>
          </div>
        </div>
      )}

      {/* ===== Results count ===== */}
      <div className="results-count">
        Showing {filtered.length} of {recommendations.length} stores
      </div>

      {/* ===== Results List ===== */}
      {filtered.length === 0 ? (
        <div className="no-results">
          <p>No stores match your filters. Try adjusting distance or store types.</p>
        </div>
      ) : (
        <>
          {/* Best Pick */}
          {bestStore && (
            <div
              className="best-pick"
              style={{ borderColor: SUPERMARKET_INFO[bestStore.store.brand].color }}
            >
              <div className="best-pick-badge">
                {sortMode === 'cheapest' ? 'Cheapest' :
                 sortMode === 'closest' ? 'Nearest' :
                 sortMode === 'coverage' ? 'Best Coverage' : 'Best Pick'}
              </div>
              <div className="best-pick-header">
                <span className="store-logo">{SUPERMARKET_INFO[bestStore.store.brand].logo}</span>
                <div>
                  <h3>{SUPERMARKET_INFO[bestStore.store.brand].name}</h3>
                  <p className="store-address">
                    {bestStore.store.address || bestStore.store.name} &mdash;{' '}
                    {formatDistance(bestStore.store.distance)} away
                  </p>
                </div>
                <div className="best-pick-price">
                  <span className="price-total">{formatPrice(bestStore.pricing.totalPrice)}</span>
                  <span className="price-coverage">
                    {bestStore.pricing.itemsFound}/{bestStore.pricing.itemsTotal} items found
                  </span>
                </div>
              </div>
              <div className="best-pick-items">
                {bestStore.pricing.items.map((item, i) =>
                  renderPriceItem(item, bestStore.store.brand, i)
                )}
              </div>
            </div>
          )}

          {/* Other stores */}
          <div className="other-stores">
            {filtered.length > 1 && <h3>Other Options</h3>}
            {filtered.slice(1).map((rec, index) => {
              const info = SUPERMARKET_INFO[rec.store.brand];
              const priceDiff = rec.pricing.totalPrice - cheapestPrice;
              const isExpanded = expandedCard === rec.store.id;

              return (
                <div key={rec.store.id}>
                  <div
                    className={`store-card ${isExpanded ? 'expanded' : ''}`}
                    style={{ borderLeftColor: info.color }}
                    onClick={() =>
                      setExpandedCard(isExpanded ? null : rec.store.id)
                    }
                  >
                    <div className="store-card-rank">#{index + 2}</div>
                    <div className="store-card-info">
                      <div className="store-card-header">
                        <span className="store-logo-sm">{info.logo}</span>
                        <span className="store-card-name">{info.name}</span>
                        <span className="store-card-distance">
                          {formatDistance(rec.store.distance)}
                        </span>
                      </div>
                      {rec.store.address && (
                        <p className="store-card-address">{rec.store.address}</p>
                      )}
                    </div>
                    <div className="store-card-pricing">
                      <span className="store-card-total">
                        {formatPrice(rec.pricing.totalPrice)}
                      </span>
                      {priceDiff > 0.01 && (
                        <span className="store-card-diff">+{formatPrice(priceDiff)}</span>
                      )}
                      <span className="store-card-coverage">
                        {rec.pricing.itemsFound}/{rec.pricing.itemsTotal} items
                      </span>
                    </div>
                    <div className="store-card-expand">
                      {isExpanded ? '\u25B2' : '\u25BC'}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="store-card-details">
                      {rec.pricing.items.map((item, i) =>
                        renderPriceItem(item, rec.store.brand, i)
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
