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
  | 'toggle_sound'
  | 'schedule_event'
  | 'create_note'
  | 'unknown';

export interface VoiceCommand {
  type: VoiceCommandType;
  taskName?: string;
  taskIdentifier?: string; // For delete/complete/update operations
  targetReference?: 'last'; // Indicates targeting relative items (e.g. last added)
  targetCount?: number; // E.g., 3 for "last 3 tasks"
  updates?: {
    title?: string;
    priority?: 'high' | 'medium' | 'low';
    deadline?: Date | null;
    category?: string;
  };
  eventDetails?: {
    title: string;
    startTime: Date;
    endTime: Date;
    allDay?: boolean;
  };
  noteDetails?: {
    title: string;
    content: string;
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

  // 2. Check for Open Modal (New Task, Settings, Notifications)
  if (/^(open|show)\s+(the\s+)?(new\s+task|task\s+creation)\s+(popup|modal|dialog|window)/i.test(lowerSpeech) ||
      /^(create\s+a\s+task\s+manually|add\s+task\s+manually)/i.test(lowerSpeech)) {
    return { type: 'open_modal', modalName: 'new_task', confidence: 'high', originalText: speech };
  }
  
  if (/^(open|show|edit|change)\s+(my\s+)?(account\s+)?(settings|profile|name|avatar|preferences)/i.test(lowerSpeech)) {
    return { type: 'open_modal', modalName: 'settings', confidence: 'high', originalText: speech };
  }

  if (/^(open|show|check|view)\s+(the\s+)?(my\s+)?(notifications|upcoming\s+notifications|reminders|upcoming\s+tasks)/i.test(lowerSpeech)) {
    return { type: 'open_modal', modalName: 'notifications', confidence: 'high', originalText: speech };
  }

  // 2.5 Check for Sound Toggle
  if (/^(toggle|change|turn\s+(on|off)|mute|unmute)\s+(the\s+)?(notification\s+)?(sound|alarm|ring|bell)/i.test(lowerSpeech)) {
    return { type: 'toggle_sound', confidence: 'high', originalText: speech };
  }

  // 2.8 Check for Calendar Scheduling
  if (/^(schedule|book|create)\s+(an\s+)?(event|meeting|call|appointment)/i.test(lowerSpeech) || 
      /^(add|put)\s+(.+)\s+(on|in)\s+(my\s+)?calendar/i.test(lowerSpeech)) {
    
    // Extract title
    let title = "New Event";
    const titleMatch = lowerSpeech.match(/(?:schedule|book|create)\s+(?:an?\s+)?(?:event|meeting|call|appointment)(?:\s+(?:called|titled|for|with)\s+(.+?))?(?:\s+(?:on|at|tomorrow|next|this|in)\b|$)/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    } else {
      const addMatch = lowerSpeech.match(/^(?:add|put)\s+(.+?)\s+(?:on|in)\s+(?:my\s+)?calendar/i);
      if (addMatch && addMatch[1]) {
        title = addMatch[1].trim();
      }
    }

    const dateTimeResult = detectDateTimeFromText(speech);
    let startTime = dateTimeResult.detectedDate || new Date();
    // Default duration to 1 hour
    let endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    
    // If no time is specified, make it all day for today/tomorrow
    let allDay = false;
    if (!dateTimeResult.detectedDate) {
      allDay = true;
    }

    return { 
      type: 'schedule_event', 
      eventDetails: { title: title.charAt(0).toUpperCase() + title.slice(1), startTime, endTime, allDay },
      confidence: 'high', 
      originalText: speech 
    };
  }

  // 2.9 Check for Note Creation
  if (/^(take\s+a\s+note|create\s+a\s+note|note\s+down|jot\s+down|make\s+a\s+note)/i.test(lowerSpeech)) {
    let content = "";
    const contentMatch = lowerSpeech.match(/^(?:take\s+a\s+note|create\s+a\s+note|note\s+down|jot\s+down|make\s+a\s+note)(?:\s+(?:that|about|saying))?\s+(.+)$/i);
    if (contentMatch && contentMatch[1]) {
      content = contentMatch[1].trim();
    }
    
    // Auto-generate title from first few words
    const title = content.length > 0 
      ? content.split(' ').slice(0, 4).join(' ') + (content.split(' ').length > 4 ? '...' : '')
      : 'Quick Note';

    return {
      type: 'create_note',
      noteDetails: { title, content: `<p>${content}</p>` },
      confidence: 'high',
      originalText: speech
    };
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
    
    // Check for "update the last task"
    if (/last\s+(task|todo|item)/i.test(lowerSpeech)) {
      const dateTimeResult = detectDateTimeFromText(speech);
      if (dateTimeResult.detectedDate) {
        return {
          type: 'update',
          targetReference: 'last',
          targetCount: 1,
          updates: { deadline: dateTimeResult.detectedDate },
          confidence: 'high',
          originalText: speech
        };
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
  // First, check relative references like "last 3 tasks"
  const deleteLastMatch = lowerSpeech.match(/^(?:delete|remove|cancel|erase|get rid of)\s+(?:the\s+)?last\s+(\d+)\s+(?:tasks|todos|items)/i);
  if (deleteLastMatch) return { type: 'delete', targetReference: 'last', targetCount: parseInt(deleteLastMatch[1], 10), confidence: 'high', originalText: speech };
  const deleteLastSingleMatch = lowerSpeech.match(/^(?:delete|remove|cancel|erase|get rid of)\s+(?:the\s+)?last\s+(?:task|todo|item)/i);
  if (deleteLastSingleMatch) return { type: 'delete', targetReference: 'last', targetCount: 1, confidence: 'high', originalText: speech };

  const deleteMatch = lowerSpeech.match(/^(?:delete|remove|cancel|erase|get rid of)\s+(?:the\s+)?(?:task|todo|item)?\s*(?:called|named)?\s*(.+)/i);
  if (deleteMatch) return { type: 'delete', taskIdentifier: deleteMatch[1].trim(), confidence: 'high', originalText: speech };

  const completeLastSingleMatch = lowerSpeech.match(/^(?:complete|finish|done|mark as done|mark as complete|i (?:finished|completed))\s+(?:the\s+)?last\s+(?:task|todo|item)/i);
  if (completeLastSingleMatch) return { type: 'complete', targetReference: 'last', targetCount: 1, confidence: 'high', originalText: speech };

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
