import { useState } from 'react';
import type { ShoppingItem, DietaryTag, GroceryCategory } from '../types';
import { DIETARY_LABELS } from '../types';
import type { SavedList } from '../services/savedLists';
import { loadSavedLists, saveLists, createSavedList } from '../services/savedLists';
import { encodeListToUrl } from '../services/listSharing';

interface SavedListsProps {
  currentItems: ShoppingItem[];
  currentDietary: DietaryTag[];
  onLoadList: (items: ShoppingItem[], dietary: DietaryTag[]) => void;
  onAddToList: (name: string, category: GroceryCategory, quantity: number) => void;
}

export function SavedLists({ currentItems, currentDietary, onLoadList, onAddToList }: SavedListsProps) {
  const [lists, setLists] = useState<SavedList[]>(loadSavedLists);
  const [saveName, setSaveName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedList, setExpandedList] = useState<string | null>(null);

  const handleSave = () => {
    if (!saveName.trim() || currentItems.length === 0) return;
    const newList = createSavedList(saveName, currentItems, currentDietary);
    const updated = [newList, ...lists];
    setLists(updated);
    saveLists(updated);
    setSaveName('');
    setShowSaveForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = lists.filter(l => l.id !== id);
    setLists(updated);
    saveLists(updated);
  };

  const handleLoad = (list: SavedList) => {
    onLoadList(list.items, list.dietary);
  };

  const handleAddToExisting = (list: SavedList) => {
    for (const item of list.items) {
      onAddToList(item.name, item.category, item.quantity);
    }
  };

  const handleShare = async (list: SavedList) => {
    const url = encodeListToUrl(list.name, list.items, list.dietary);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(list.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: show prompt
      prompt('Copy this link to share:', url);
    }
  };

  const handleShareCurrent = async () => {
    if (currentItems.length === 0) return;
    const url = encodeListToUrl('Shared List', currentItems, currentDietary);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId('current');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      prompt('Copy this link to share:', url);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="saved-lists">
      <div className="saved-lists-header">
        <h2>Saved & Shared Lists</h2>
      </div>

      {/* Actions for current list */}
      <div className="current-list-actions">
        <div className="current-list-info">
          Current list: <strong>{currentItems.length} items</strong>
          {currentDietary.length > 0 && (
            <span className="current-dietary-tags">
              {currentDietary.map(t => (
                <span key={t} className="item-dietary-badge">{DIETARY_LABELS[t].icon}</span>
              ))}
            </span>
          )}
        </div>
        <div className="current-list-btns">
          {!showSaveForm ? (
            <>
              <button
                className="btn-saved-action save"
                onClick={() => setShowSaveForm(true)}
                disabled={currentItems.length === 0}
              >
                Save Current List
              </button>
              <button
                className="btn-saved-action share"
                onClick={handleShareCurrent}
                disabled={currentItems.length === 0}
              >
                {copiedId === 'current' ? 'Link Copied!' : 'Share Current List'}
              </button>
            </>
          ) : (
            <div className="save-form">
              <input
                type="text"
                placeholder="List name (e.g. Weekly Shop, BBQ)"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              <button className="btn-saved-action save" onClick={handleSave}>Save</button>
              <button className="btn-saved-action" onClick={() => { setShowSaveForm(false); setSaveName(''); }}>Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Saved lists */}
      {lists.length === 0 ? (
        <div className="saved-lists-empty">
          <p>No saved lists yet</p>
          <p className="empty-hint">Save your current shopping list as a template to reuse later</p>
        </div>
      ) : (
        <div className="saved-lists-grid">
          {lists.map(list => {
            const isExpanded = expandedList === list.id;
            return (
              <div key={list.id} className="saved-list-card">
                <div className="saved-list-card-header" onClick={() => setExpandedList(isExpanded ? null : list.id)}>
                  <div>
                    <h4>{list.name}</h4>
                    <div className="saved-list-meta">
                      <span>{list.items.length} items</span>
                      <span>&middot;</span>
                      <span>{formatDate(list.createdAt)}</span>
                      {list.dietary.length > 0 && (
                        <>
                          <span>&middot;</span>
                          {list.dietary.map(t => (
                            <span key={t} className="item-dietary-badge">{DIETARY_LABELS[t].icon}</span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                  <span className="saved-list-expand">{isExpanded ? '\u25B2' : '\u25BC'}</span>
                </div>

                {isExpanded && (
                  <div className="saved-list-details">
                    <div className="saved-list-items">
                      {list.items.map((item, i) => (
                        <span key={i} className="ingredient-chip">
                          {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                        </span>
                      ))}
                    </div>
                    <div className="saved-list-actions">
                      <button className="btn-meal-action" onClick={() => handleLoad(list)}>
                        Load (Replace)
                      </button>
                      <button className="btn-meal-action" onClick={() => handleAddToExisting(list)}>
                        Add to Current
                      </button>
                      <button className="btn-meal-action" onClick={() => handleShare(list)}>
                        {copiedId === list.id ? 'Copied!' : 'Share Link'}
                      </button>
                      <button className="btn-meal-action danger" onClick={() => handleDelete(list.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
