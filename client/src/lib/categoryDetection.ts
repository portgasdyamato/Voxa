import type { Category } from "@shared/schema";

/**
 * Parses a category from text and returns both the category ID and cleaned text.
 * @param text The task title or description
 * @param categories Available categories from the database
 * @returns Object with categoryId and cleanedText
 */
export function parseCategoryFromText(text: string, categories: Category[]): { categoryId: number | null, cleanedText: string } {
  if (!text || !categories || categories.length === 0) return { categoryId: null, cleanedText: text };
  
  let cleanedText = text;
  let categoryId: number | null = null;
  const sortedCategories = [...categories].sort((a, b) => b.name.length - a.name.length);
  
  // 1. Specific phrase matches (most specific)
  // Like "in work", "personal category", "shopping task"
  for (const category of sortedCategories) {
    const lowerName = category.name.toLowerCase();
    const patterns = [
      new RegExp(`\\bin ${lowerName}\\b`, 'i'),
      new RegExp(`\\b${lowerName} category\\b`, 'i'),
      new RegExp(`\\b${lowerName} task\\b`, 'i'),
      new RegExp(`\\b${lowerName} item\\b`, 'i'),
      new RegExp(`\\bfor ${lowerName}\\b`, 'i'),
    ];

    for (const pattern of patterns) {
      if (pattern.test(cleanedText)) {
        categoryId = category.id;
        cleanedText = cleanedText.replace(pattern, '').trim();
        break;
      }
    }
    if (categoryId) break;
  }

  // 2. Exact name match with aggressive separator cleaning (at start or end)
  if (!categoryId) {
    for (const category of sortedCategories) {
      const lowerName = category.name.toLowerCase();
      
      // Look for the category name at the very end or very start
      // Often separated by punctuation (., #, -, /, :) and whitespace
      // We handle optional trailing punctuation as well
      const endPattern = new RegExp(`[\\s\\.#\\-:/]+\\b${lowerName}\\b[\\s\\.#\\-:/]*$`, 'i');
      const startPattern = new RegExp(`^\\b${lowerName}\\b[\\s\\.#\\-:/]+`, 'i');
      
      if (endPattern.test(cleanedText)) {
        categoryId = category.id;
        cleanedText = cleanedText.replace(endPattern, '').trim();
        break;
      } else if (startPattern.test(cleanedText)) {
        categoryId = category.id;
        cleanedText = cleanedText.replace(startPattern, '').trim();
        break;
      }
    }
  }

  // 3. Keyword fallback (Broad categories)
  const keywordMap: Record<string, string[]> = {
    'work': ['work', 'meeting', 'email', 'project', 'client', 'report', 'office', 'presentation', 'deadline', 'colleague', 'manager', 'business', 'job', 'task', 'doc', 'spreadsheet', 'zoom', 'call'],
    'personal': ['personal', 'home', 'family', 'friend', 'social', 'call', 'party', 'dinner', 'birthday', 'anniversary', 'vacation', 'trip', 'bank', 'insurance'],
    'shopping': ['buy', 'purchase', 'get', 'grocery', 'store', 'market', 'amazon', 'shopping', 'milk', 'bread', 'food', 'items', 'list'],
    'health': ['gym', 'workout', 'exercise', 'run', 'doctor', 'dentist', 'medicine', 'pill', 'health', 'fitness', 'yoga', 'appointment', 'clinic', 'hospital'],
    'learning': ['study', 'learn', 'read', 'book', 'course', 'class', 'exam', 'test', 'homework', 'practice', 'skill', 'university', 'college', 'school'],
    'finance': ['bill', 'pay', 'bank', 'money', 'budget', 'tax', 'rent', 'invest', 'loan', 'credit', 'payment', 'salary', 'expense'],
    'travel': ['flight', 'hotel', 'ticket', 'passport', 'luggage', 'suitcase', 'packing', 'trip', 'travel', 'airport', 'train', 'bus', 'destination'],
    'coding': ['code', 'bug', 'feature', 'git', 'github', 'push', 'commit', 'deploy', 'production', 'development', 'frontend', 'backend', 'api', 'database', 'script', 'fix']
  };

  if (!categoryId) {
    for (const category of categories) {
      const lowerName = category.name.toLowerCase();
      const keywords = keywordMap[lowerName];
      if (keywords && keywords.some(keyword => cleanedText.toLowerCase().includes(keyword))) {
        categoryId = category.id;
        // Strip if it's the exact keyword at the end
        const kwEndPattern = new RegExp(`[\\s\\.#\\-:/]+\\b${lowerName}\\b[\\s\\.#\\-:/]*$`, 'i');
        if (kwEndPattern.test(cleanedText)) {
           cleanedText = cleanedText.replace(kwEndPattern, '').trim();
        }
        break;
      }
    }
  }

  // 4. Final Aggressive Cleanup
  cleanedText = cleanedText
    .replace(/[ \.\-#:/]{2,}/g, ' ')
    .replace(/^[ \.\-#:/]+|[ \.\-#:/]+$/g, '')
    .trim();

  return { categoryId, cleanedText };
}

/**
 * Detects a category from text and returns the category ID.
 * @param text The task title or description
 * @param categories Available categories from the database
 * @returns The ID of the detected category or null
 */
export function detectCategory(text: string, categories: Category[]): number | null {
  const result = parseCategoryFromText(text, categories);
  return result.categoryId;
}
