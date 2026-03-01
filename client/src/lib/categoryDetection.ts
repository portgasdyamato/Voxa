import type { Category } from "@shared/schema";

/**
 * Detects a category from text based on category names and common keywords.
 * @param text The task title or description
 * @param categories Available categories from the database
 * @returns The ID of the detected category or null
 */
export function detectCategory(text: string, categories: Category[]): number | null {
  if (!text || !categories || categories.length === 0) return null;
  
  const lowerText = text.toLowerCase();
  
  // 1. Try to find an exact match for a category name in the text
  // We sort by length descending to match "Work Project" before "Work"
  const sortedCategories = [...categories].sort((a, b) => b.name.length - a.name.length);
  
  for (const category of sortedCategories) {
    const lowerName = category.name.toLowerCase();
    // Use word boundaries to avoid matching "Work" in "Artwork"
    const regex = new RegExp(`\\b${lowerName}\\b`, 'i');
    if (regex.test(lowerText)) {
      return category.id;
    }
  }
  
  // 2. Common keyword mapping for typical productivity categories
  // These are fallbacks if the user names categories standard things
  const keywordMap: Record<string, string[]> = {
    'work': ['meeting', 'email', 'project', 'client', 'report', 'office', 'presentation', 'deadline', 'colleague', 'manager', 'business', 'job', 'task', 'doc', 'spreadsheet', 'zoom', 'call'],
    'personal': ['home', 'family', 'friend', 'social', 'call', 'party', 'dinner', 'birthday', 'anniversary', 'vacation', 'trip', 'bank', 'insurance'],
    'shopping': ['buy', 'purchase', 'get', 'grocery', 'store', 'market', 'amazon', 'shopping', 'milk', 'bread', 'food', 'items', 'list'],
    'health': ['gym', 'workout', 'exercise', 'run', 'doctor', 'dentist', 'medicine', 'pill', 'health', 'fitness', 'yoga', 'appointment', 'clinic', 'hospital'],
    'learning': ['study', 'learn', 'read', 'book', 'course', 'class', 'exam', 'test', 'homework', 'practice', 'skill', 'university', 'college', 'school'],
    'finance': ['bill', 'pay', 'bank', 'money', 'budget', 'tax', 'rent', 'invest', 'loan', 'credit', 'payment', 'salary', 'expense'],
    'travel': ['flight', 'hotel', 'ticket', 'passport', 'luggage', 'suitcase', 'packing', 'trip', 'travel', 'airport', 'train', 'bus', 'destination'],
    'coding': ['code', 'bug', 'feature', 'git', 'github', 'push', 'commit', 'deploy', 'production', 'development', 'frontend', 'backend', 'api', 'database', 'script', 'fix']
  };

  // Check keywords for each category
  for (const category of categories) {
    const lowerName = category.name.toLowerCase();
    const keywords = keywordMap[lowerName];
    
    if (keywords) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category.id;
      }
    }
  }

  // 3. Regex-based pattern matching for "in [category]" or "[category] task"
  for (const category of sortedCategories) {
     const lowerName = category.name.toLowerCase();
     const patterns = [
       new RegExp(`in ${lowerName}`, 'i'),
       new RegExp(`${lowerName} task`, 'i'),
       new RegExp(`${lowerName} item`, 'i'),
       new RegExp(`for ${lowerName}`, 'i'),
     ];
     
     if (patterns.some(p => p.test(lowerText))) {
       return category.id;
     }
  }

  return null;
}
