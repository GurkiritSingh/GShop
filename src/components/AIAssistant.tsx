import { useState, useRef, useEffect } from 'react';
import type { GroceryCategory, DietaryTag } from '../types';
import { CATEGORY_LABELS } from '../types';
import { sendAIMessage } from '../services/aiService';
import type { AIChatMessage, AIResponse, AIShoppingItem, AIMealSuggestion } from '../services/aiService';

interface AIAssistantProps {
  onAddToShoppingList: (name: string, category: GroceryCategory, quantity: number) => void;
  dietaryFilters: DietaryTag[];
  allergens: string[];
}

interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
  shoppingItems?: AIShoppingItem[];
  mealSuggestions?: AIMealSuggestion[];
  addedItems?: Set<string>;
}

const QUICK_PROMPTS = [
  'Suggest healthy meals for the week under £40',
  'I need a quick weeknight dinner',
  'Plan a Sunday roast with shopping list',
  'Suggest high-protein meal prep ideas',
];

export function AIAssistant({ onAddToShoppingList, dietaryFilters, allergens }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userEntry: ChatEntry = { role: 'user', content: msg };
    setMessages(prev => [...prev, userEntry]);
    setLoading(true);

    try {
      // Build history for API (just role + content strings)
      const history: AIChatMessage[] = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response: AIResponse = await sendAIMessage(msg, history, dietaryFilters, allergens);

      const assistantEntry: ChatEntry = {
        role: 'assistant',
        content: response.message,
        shoppingItems: response.shopping_items,
        mealSuggestions: response.meal_suggestions,
        addedItems: new Set()
      };

      setMessages(prev => [...prev, assistantEntry]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I hit an error: ${errorMsg}. Please try again.` }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleAddItem = (item: AIShoppingItem, key: string) => {
    onAddToShoppingList(item.name, item.category, item.quantity);
    setAddedItems(prev => new Set(prev).add(key));
  };

  const handleAddAllIngredients = (meal: AIMealSuggestion, mealKey: string) => {
    meal.ingredients.forEach(ing => {
      onAddToShoppingList(ing.name, ing.category, ing.quantity);
    });
    setAddedItems(prev => new Set(prev).add(mealKey));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-3xl">smart_toy</span>
          <h2 className="text-2xl font-black tracking-tight">AI Shopping Assistant</h2>
        </div>
        <p className="text-violet-100 text-sm">Tell me what you want to eat and I'll build your shopping list. I know UK supermarkets inside out.</p>
      </div>

      {/* Quick prompts (show when no messages) */}
      {messages.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="text-left p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 hover:border-primary hover:bg-surface-container-high transition text-sm font-medium text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined text-base mr-2 align-middle text-primary">arrow_forward</span>
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4 min-h-[200px]">
        {messages.map((entry, i) => (
          <div key={i} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${entry.role === 'user' ? '' : 'w-full'}`}>
              {/* Message bubble */}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                entry.role === 'user'
                  ? 'bg-primary text-on-primary rounded-br-sm'
                  : 'bg-surface-container-low text-on-surface rounded-bl-sm'
              }`}>
                {entry.content}
              </div>

              {/* Shopping items */}
              {entry.shoppingItems && entry.shoppingItems.length > 0 && (
                <div className="mt-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden">
                  <div className="px-4 py-2 bg-surface-container-low border-b border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">shopping_cart</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Suggested Items</span>
                  </div>
                  <div className="p-2">
                    {entry.shoppingItems.map((item, j) => {
                      const key = `item-${i}-${j}`;
                      const isAdded = addedItems.has(key);
                      return (
                        <div key={j} className="flex items-center justify-between px-3 py-2 hover:bg-surface-container-low rounded-lg transition">
                          <div>
                            <span className="text-sm font-semibold text-on-surface">{item.name}</span>
                            <span className="text-xs text-outline ml-2">x{item.quantity} &middot; {CATEGORY_LABELS[item.category] || item.category}</span>
                          </div>
                          <button
                            onClick={() => handleAddItem(item, key)}
                            disabled={isAdded}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${
                              isAdded
                                ? 'bg-surface-container-high text-outline cursor-default'
                                : 'bg-primary text-on-primary hover:scale-105 active:scale-95'
                            }`}
                          >
                            {isAdded ? 'Added' : '+ Add'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Meal suggestions */}
              {entry.mealSuggestions && entry.mealSuggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {entry.mealSuggestions.map((meal, j) => {
                    const mealKey = `meal-${i}-${j}`;
                    const isAdded = addedItems.has(mealKey);
                    return (
                      <div key={j} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden">
                        <div className="px-4 py-3 border-b border-outline-variant/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-on-surface">{meal.name}</h4>
                              <span className="text-xs text-outline">Serves {meal.servings} &middot; {meal.ingredients.length} ingredients</span>
                            </div>
                            <button
                              onClick={() => handleAddAllIngredients(meal, mealKey)}
                              disabled={isAdded}
                              className={`text-xs font-bold px-3 py-1.5 rounded-full transition flex items-center gap-1 ${
                                isAdded
                                  ? 'bg-surface-container-high text-outline cursor-default'
                                  : 'bg-emerald-500 text-white hover:scale-105 active:scale-95'
                              }`}
                            >
                              <span className="material-symbols-outlined text-sm">{isAdded ? 'check' : 'add_shopping_cart'}</span>
                              {isAdded ? 'Added all' : 'Add all'}
                            </button>
                          </div>
                          {meal.tags.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {meal.tags.map(tag => (
                                <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">
                                  {tag.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {meal.ingredients.map((ing, k) => (
                              <span key={k} className="text-xs bg-surface-container-low text-on-surface-variant px-2 py-1 rounded-lg">
                                {ing.name} x{ing.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-container-low rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs text-outline">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 bg-background pt-2 pb-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="What do you fancy eating this week?"
            className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-on-surface placeholder:text-outline transition"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
