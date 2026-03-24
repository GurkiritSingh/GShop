import { useState, useMemo } from 'react';
import type { SupermarketBrand } from '../types';
import { SUPERMARKET_INFO } from '../types';
import {
  getAvailableItems, getFullPricesForItem, setUserPrice,
  removeUserPrice, getOverrideCount, clearAllOverrides,
} from '../services/priceService';
import { getProductSearchUrl } from '../services/storeLinks';

const allItems = getAvailableItems();

export function PriceEditor() {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ brand: SupermarketBrand } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return allItems.slice(0, 30);
    const q = search.toLowerCase();
    return allItems.filter(item => item.includes(q)).slice(0, 30);
  }, [search]);

  const prices = useMemo(() => {
    if (!selectedItem) return [];
    return getFullPricesForItem(selectedItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, refreshKey]);

  const overrideCount = useMemo(() => getOverrideCount(), [refreshKey]);

  const handleStartEdit = (brand: SupermarketBrand, currentPrice: number) => {
    setEditingCell({ brand });
    setEditValue(currentPrice.toFixed(2));
  };

  const handleSaveEdit = () => {
    if (!selectedItem || !editingCell) return;
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) return;
    setUserPrice(selectedItem, editingCell.brand, Math.round(val * 100) / 100);
    setEditingCell(null);
    setRefreshKey(k => k + 1);
  };

  const handleResetPrice = (brand: SupermarketBrand) => {
    if (!selectedItem) return;
    removeUserPrice(selectedItem, brand);
    setRefreshKey(k => k + 1);
  };

  const handleClearAll = () => {
    if (confirm('Reset all custom prices back to defaults?')) {
      clearAllOverrides();
      setRefreshKey(k => k + 1);
    }
  };

  return (
    <div className="price-editor">
      <div className="price-editor-header">
        <h2>Price Editor</h2>
        {overrideCount > 0 && (
          <div className="override-info">
            <span className="override-count">{overrideCount} custom price{overrideCount !== 1 ? 's' : ''}</span>
            <button className="btn-clear-overrides" onClick={handleClearAll}>Reset All</button>
          </div>
        )}
      </div>

      <p className="price-editor-desc">
        Search for an item, then click any price to update it. Your edits are saved locally and used in all comparisons.
      </p>

      {/* Search */}
      <div className="price-search">
        <input
          type="text"
          placeholder="Search items... (e.g. milk, chicken breast, heinz beans)"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Item list */}
      {!selectedItem ? (
        <div className="price-item-list">
          {filteredItems.map(item => (
            <button
              key={item}
              className="price-item-btn"
              onClick={() => setSelectedItem(item)}
            >
              {item}
            </button>
          ))}
          {filteredItems.length === 0 && (
            <p className="price-no-results">No items found</p>
          )}
        </div>
      ) : (
        <div className="price-detail">
          <button className="price-back-btn" onClick={() => setSelectedItem(null)}>
            &larr; Back to search
          </button>

          <h3 className="price-detail-title">{selectedItem}</h3>

          <div className="price-table">
            <div className="price-table-header">
              <span>Store</span>
              <span>Price</span>
              <span></span>
            </div>
            {prices
              .sort((a, b) => a.price - b.price)
              .map((p) => {
                const info = SUPERMARKET_INFO[p.brand];
                const isEditing = editingCell?.brand === p.brand;
                const searchUrl = getProductSearchUrl(p.brand, p.productName);

                return (
                  <div key={p.brand} className={`price-table-row ${p.isOverride ? 'has-override' : ''}`}>
                    <div className="price-table-store">
                      <span className="price-store-logo">{info.logo}</span>
                      <div>
                        <span className="price-store-name">{info.name}</span>
                        <span className="price-product-name">
                          {searchUrl ? (
                            <a href={searchUrl} target="_blank" rel="noopener noreferrer">
                              {p.productName} &#x2197;
                            </a>
                          ) : (
                            p.productName
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="price-table-price">
                      {isEditing ? (
                        <div className="price-edit-input">
                          <span className="price-pound">&pound;</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            autoFocus
                          />
                          <button className="price-save-btn" onClick={handleSaveEdit}>Save</button>
                          <button className="price-cancel-btn" onClick={() => setEditingCell(null)}>x</button>
                        </div>
                      ) : (
                        <button
                          className="price-value-btn"
                          onClick={() => handleStartEdit(p.brand, p.price)}
                          title="Click to edit"
                        >
                          &pound;{p.price.toFixed(2)}
                          {p.isOverride && <span className="override-badge">edited</span>}
                        </button>
                      )}
                    </div>

                    <div className="price-table-actions">
                      {p.isOverride && !isEditing && (
                        <button
                          className="price-reset-btn"
                          onClick={() => handleResetPrice(p.brand)}
                          title="Reset to default"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
