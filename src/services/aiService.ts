import type { GroceryCategory, DietaryTag } from '../types';

// Supabase Edge Function hosts the AI endpoint
const SUPABASE_URL = 'https://qrswutkoygynhtzpxqfi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyc3d1dGtveWd5bmh0enB4cWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjQ3MTcsImV4cCI6MjA5MDEwMDcxN30.ITBPc-Qm2LlSk4asrXUfor9JFSZ95iT3AYJ6Cm-vlPY';

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
  const response = await fetch(`${SUPABASE_URL}/functions/v1/gshop-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
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
