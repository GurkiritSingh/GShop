import { useState } from 'react';
import { useBudget } from '../hooks/useBudget';

export function BudgetTracker({ estimatedTotal, storeName }: { estimatedTotal?: number; storeName?: string }) {
  const {
    weeklyBudget, history, thisWeekSpend, remaining,
    setWeeklyBudget, logShop, clearHistory,
  } = useBudget();

  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(weeklyBudget.toString());
  const [showHistory, setShowHistory] = useState(false);

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      setWeeklyBudget(Math.round(val * 100) / 100);
    }
    setEditingBudget(false);
  };

  const handleLogShop = () => {
    if (estimatedTotal && storeName) {
      logShop(estimatedTotal, storeName, 0);
    }
  };

  const pct = weeklyBudget > 0 ? Math.min((thisWeekSpend / weeklyBudget) * 100, 100) : 0;
  const isOver = remaining !== null && remaining < 0;
  const isWarning = remaining !== null && remaining >= 0 && remaining < weeklyBudget * 0.2;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="budget-tracker">
      <div className="budget-header">
        <h3>Budget</h3>
        {!editingBudget ? (
          <button className="budget-edit-btn" onClick={() => { setEditingBudget(true); setBudgetInput(weeklyBudget.toString()); }}>
            {weeklyBudget > 0 ? `\u00A3${weeklyBudget.toFixed(2)}/week` : 'Set budget'}
          </button>
        ) : (
          <div className="budget-edit-row">
            <span>\u00A3</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveBudget()}
              autoFocus
            />
            <span>/week</span>
            <button className="budget-save-btn" onClick={handleSaveBudget}>Save</button>
          </div>
        )}
      </div>

      {weeklyBudget > 0 && (
        <div className="budget-progress">
          <div className="budget-bar-bg">
            <div
              className={`budget-bar-fill ${isOver ? 'over' : isWarning ? 'warning' : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="budget-stats">
            <span>Spent: <strong>\u00A3{thisWeekSpend.toFixed(2)}</strong></span>
            {remaining !== null && (
              <span className={isOver ? 'budget-over' : isWarning ? 'budget-warn' : 'budget-ok'}>
                {isOver
                  ? `\u00A3${Math.abs(remaining).toFixed(2)} over budget`
                  : `\u00A3${remaining.toFixed(2)} remaining`
                }
              </span>
            )}
          </div>
          {estimatedTotal && (
            <div className="budget-estimate">
              {remaining !== null && estimatedTotal > remaining && remaining > 0 ? (
                <span className="budget-warn">This shop (\u00A3{estimatedTotal.toFixed(2)}) would put you over budget</span>
              ) : (
                <span>Estimated shop: \u00A3{estimatedTotal.toFixed(2)}</span>
              )}
            </div>
          )}
        </div>
      )}

      {estimatedTotal && storeName && (
        <button className="budget-log-btn" onClick={handleLogShop}>
          Log this shop (\u00A3{estimatedTotal.toFixed(2)} at {storeName})
        </button>
      )}

      {history.length > 0 && (
        <div className="budget-history-section">
          <button
            className="budget-history-toggle"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide' : 'Show'} history ({history.length})
          </button>

          {showHistory && (
            <>
              <div className="budget-history">
                {history.slice(0, 10).map((h, i) => (
                  <div key={i} className="budget-history-row">
                    <span className="bh-store">{h.store}</span>
                    <span className="bh-amount">\u00A3{h.total.toFixed(2)}</span>
                    <span className="bh-date">{formatDate(h.date)}</span>
                  </div>
                ))}
              </div>
              <button className="budget-clear-btn" onClick={clearHistory}>Clear history</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
