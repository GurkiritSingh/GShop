import { useState, useCallback } from 'react';

const STORAGE_KEY = 'gshop-budget';

interface BudgetData {
  weeklyBudget: number;
  history: { date: string; total: number; store: string; items: number }[];
}

function load(): BudgetData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  return { weeklyBudget: 0, history: [] };
}

function save(data: BudgetData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useBudget() {
  const [data, setData] = useState<BudgetData>(load);

  const setWeeklyBudget = useCallback((amount: number) => {
    setData(prev => {
      const next = { ...prev, weeklyBudget: amount };
      save(next);
      return next;
    });
  }, []);

  const logShop = useCallback((total: number, store: string, items: number) => {
    setData(prev => {
      const entry = {
        date: new Date().toISOString(),
        total,
        store,
        items,
      };
      const next = { ...prev, history: [entry, ...prev.history].slice(0, 50) };
      save(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setData(prev => {
      const next = { ...prev, history: [] };
      save(next);
      return next;
    });
  }, []);

  // Spending this week (Mon-Sun)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const thisWeekSpend = data.history
    .filter(h => new Date(h.date) >= monday)
    .reduce((sum, h) => sum + h.total, 0);

  const remaining = data.weeklyBudget > 0 ? data.weeklyBudget - thisWeekSpend : null;

  return {
    weeklyBudget: data.weeklyBudget,
    history: data.history,
    thisWeekSpend,
    remaining,
    setWeeklyBudget,
    logShop,
    clearHistory,
  };
}
