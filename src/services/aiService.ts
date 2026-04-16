import type { GroceryCategory, DietaryTag } from '../types';

// Backend URL — MediEat server on Render hosts the AI endpoint
const AI_BACKEND = import.meta.env.VITE_AI_BACKEND_URL || 'https://medieat.onrender.com';

export interface AIShoppingItem {
  name: string;
  quantity: number;
  category: GroceryCategory;
}

export interface AIMealSuggestion {
  name: string;
  servings: number;
  tags: DietaryTag[];
  ingredients: AIShoppingItem[];
}

export interface AIResponse {
  message: string;
  shopping_items?: AIShoppingItem[];
  meal_suggestions?: AIMealSuggestion[];
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendAIMessage(
  message: string,
  history: AIChatMessage[],
  dietaryFilters: DietaryTag[],
  allergens: string[],
  budget?: number
): Promise<AIResponse> {
  const response = await fetch(`${AI_BACKEND}/api/gshop/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversationHistory: history,
      dietaryFilters,
      allergens,
      budget
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'AI request failed');
  }

  return response.json();
}
