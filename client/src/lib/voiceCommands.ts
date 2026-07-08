import { parseTaskFromSpeech, detectDateTimeFromText } from './dateDetection';

export type VoiceCommandType = 
  | 'add'
  | 'delete'
  | 'complete'
  | 'uncomplete'
  | 'update'
  | 'list'
  | 'clear_completed'
  | 'navigate'
  | 'open_modal'
  | 'set_filter'
  | 'search'
  | 'unknown';

export interface VoiceCommand {
  type: VoiceCommandType;
  taskName?: string;
  taskIdentifier?: string; // For delete/complete/update operations
  updates?: {
    title?: string;
    priority?: 'high' | 'medium' | 'low';
    deadline?: Date | null;
    category?: string;
  };
  destination?: string;
  modalName?: string;
  filterId?: string;
  categoryId?: number;
  searchQuery?: string;
  confidence: 'high' | 'medium' | 'low';
  originalText: string;
}

export function parseVoiceCommand(speech: string, categories: any[] = [], tasks: any[] = []): VoiceCommand {
  const lowerSpeech = speech.toLowerCase().trim();
  
  // 1. Check for Navigation
  if (/^(go|navigate|take me|open)\s+(to\s+)?(the\s+)?(home|dashboard|workspace|tasks|analytics|stats|statistics)/i.test(lowerSpeech) || 
      /^(show|view)\s+(me\s+)?(the\s+)?(analytics|stats|statistics|dashboard)/i.test(lowerSpeech)) {
    let route = '/home';
    if (/(analytics|stats|statistics)/i.test(lowerSpeech)) route = '/stats';
    return { type: 'navigate', destination: route, confidence: 'high', originalText: speech };
  }

  // 2. Check for Open Modal
  if (/^(open|show)\s+(the\s+)?(new\s+task|task\s+creation)\s+(popup|modal|dialog|window)/i.test(lowerSpeech) ||
      /^(create\s+a\s+task\s+manually|add\s+task\s+manually)/i.test(lowerSpeech)) {
    return { type: 'open_modal', modalName: 'new_task', confidence: 'high', originalText: speech };
  }

  // 3. Check for Filtering (including "search for today's task")
  // First, check if it's asking for a specific category
  let matchedCategory = categories.find(c => lowerSpeech.includes(c.name.toLowerCase()));
  if ((lowerSpeech.includes('show') || lowerSpeech.includes('filter') || lowerSpeech.includes('search') || lowerSpeech.includes('find') || lowerSpeech.includes('view') || lowerSpeech.includes('what')) && matchedCategory) {
    return { type: 'set_filter', categoryId: matchedCategory.id, confidence: 'high', originalText: speech };
  }

  // Next, check for built-in filters
  if (/today|overdue|priority|all tasks/i.test(lowerSpeech)) {
    if (/(show|filter|search|find|view|what)/i.test(lowerSpeech) || lowerSpeech.includes('today')) {
      let filterId = 'all';
      if (lowerSpeech.includes('today')) filterId = 'today';
      if (lowerSpeech.includes('overdue') || lowerSpeech.includes('priority')) filterId = 'overdue';
      return { type: 'set_filter', filterId, confidence: 'high', originalText: speech };
    }
  }

  // 4. Check for Update (very flexible)
  if (/(update|change|modify|edit|reschedule|move|make it)/i.test(lowerSpeech)) {
    // Try to find if any existing task is mentioned in the speech
    let targetTask = null;
    // Sort by length descending to match longest task names first
    const sortedTasks = [...tasks].sort((a, b) => b.title.length - a.title.length);
    for (const t of sortedTasks) {
      if (lowerSpeech.includes(t.title.toLowerCase())) {
        targetTask = t;
        break;
      }
    }
    
    // If a task was identified, or it strongly looks like an update
    if (targetTask) {
      const dateTimeResult = detectDateTimeFromText(speech);
      if (dateTimeResult.detectedDate) {
        return {
          type: 'update',
          taskIdentifier: targetTask.title,
          updates: { deadline: dateTimeResult.detectedDate },
          confidence: 'high',
          originalText: speech
        };
      }
    } else {
      // Fallback regex for "update X to Y"
      const updateMatch = lowerSpeech.match(/^(?:update|change|modify|edit)\s+(?:the\s+task\s+)?(.+?)\s+(?:to|instead of|for)\s+(.+)/i);
      if (updateMatch) {
        const identifier = updateMatch[1].trim();
        const newValue = updateMatch[2].trim();
        const dateTimeResult = detectDateTimeFromText(newValue);
        if (dateTimeResult.detectedDate) {
          return { type: 'update', taskIdentifier: identifier, updates: { deadline: dateTimeResult.detectedDate }, confidence: 'high', originalText: speech };
        }
        return { type: 'update', taskIdentifier: identifier, updates: { title: newValue }, confidence: 'high', originalText: speech };
      }
    }
  }

  // 5. Check for Delete/Complete/Uncomplete
  const deleteMatch = lowerSpeech.match(/^(?:delete|remove|cancel|erase|get rid of)\s+(?:the\s+)?(?:task|todo|item)?\s*(?:called|named)?\s*(.+)/i);
  if (deleteMatch) return { type: 'delete', taskIdentifier: deleteMatch[1].trim(), confidence: 'high', originalText: speech };

  const completeMatch = lowerSpeech.match(/^(?:complete|finish|done|mark as done|mark as complete|i (?:finished|completed))\s+(?:the\s+)?(?:task|todo|item)?\s*(?:called|named)?\s*(.+)/i);
  if (completeMatch) return { type: 'complete', taskIdentifier: completeMatch[1].trim(), confidence: 'high', originalText: speech };

  const uncompleteMatch = lowerSpeech.match(/^(?:uncomplete|unfinish|mark as incomplete|mark as not done|reopen)\s+(?:the\s+)?(?:task|todo|item)?\s*(?:called|named)?\s*(.+)/i);
  if (uncompleteMatch) return { type: 'uncomplete', taskIdentifier: uncompleteMatch[1].trim(), confidence: 'high', originalText: speech };

  // 6. Check for Clear Completed & List
  if (/^(?:clear|delete|remove)\s+(?:all\s+)?(?:completed|finished|done)\s+(?:tasks|todos|items)/i.test(lowerSpeech)) {
    return { type: 'clear_completed', confidence: 'high', originalText: speech };
  }
  if (/^(?:show|list|display|what are|tell me)\s+(?:all\s+)?(?:my\s+)?(?:tasks|todos|items)/i.test(lowerSpeech) || /^(?:what do i have to do|what'?s on my list)/i.test(lowerSpeech)) {
    return { type: 'list', confidence: 'high', originalText: speech };
  }

  // 7. Check for explicit Search (only if it didn't match a filter above)
  const searchMatch = lowerSpeech.match(/^(?:search|find|look\s+for)\s+(?:for\s+)?(.+)/i);
  if (searchMatch) {
    return { type: 'search', searchQuery: searchMatch[1].trim(), confidence: 'high', originalText: speech };
  }

  // 8. Fallback to Add Task
  const parsed = parseTaskFromSpeech(speech);
  return {
    type: 'add',
    taskName: parsed.taskName,
    updates: {
      title: parsed.taskName,
      priority: parsed.priority,
      deadline: parsed.deadline,
    },
    confidence: 'low', // Changed to low because it's a fallback
    originalText: speech,
  };
}

// Helper function to find task by name/identifier
export function findTaskByIdentifier(tasks: any[], identifier: string): any | null {
  const lowerIdentifier = identifier.toLowerCase().trim();
  
  // Try exact match first
  let found = tasks.find(task => 
    task.title.toLowerCase() === lowerIdentifier
  );
  
  if (found) return found;
  
  // Try partial match (contains)
  found = tasks.find(task => 
    task.title.toLowerCase().includes(lowerIdentifier)
  );
  
  if (found) return found;
  
  // Try fuzzy match (identifier contains task name or vice versa)
  found = tasks.find(task => {
    const taskTitle = task.title.toLowerCase();
    return lowerIdentifier.includes(taskTitle) || taskTitle.includes(lowerIdentifier);
  });
  
  return found || null;
}
