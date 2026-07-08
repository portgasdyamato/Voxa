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
  searchQuery?: string;
  confidence: 'high' | 'medium' | 'low';
  originalText: string;
}

export function parseVoiceCommand(speech: string): VoiceCommand {
  const lowerSpeech = speech.toLowerCase().trim();
  
  // Command patterns for different operations
  const commandPatterns = {
    // Add task patterns
    add: [
      /^(?:add|create|new|make|save|remind me to|i need to|don'?t forget to|schedule)\s+(?:a\s+)?(?:task|todo|item)?\s*(.+)/i,
      /^(?:add|create|new|make)\s+(.+)/i,
    ],
    
    // Delete task patterns
    delete: [
      /^(?:delete|remove|cancel|erase|get rid of)\s+(?:the\s+)?(?:task|todo|item)?\s*(?:called|named)?\s*(.+)/i,
      /^(?:delete|remove|cancel)\s+(.+)/i,
    ],
    
    // Complete task patterns
    complete: [
      /^(?:complete|finish|done|mark as done|mark as complete|i (?:finished|completed))\s+(?:the\s+)?(?:task|todo|item)?\s*(?:called|named)?\s*(.+)/i,
      /^(?:complete|finish|done)\s+(.+)/i,
    ],
    
    // Uncomplete task patterns
    uncomplete: [
      /^(?:uncomplete|unfinish|mark as incomplete|mark as not done|reopen)\s+(?:the\s+)?(?:task|todo|item)?\s*(?:called|named)?\s*(.+)/i,
    ],
    
    // Update task patterns
    update: [
      /^(?:update|change|modify|edit|postpone|reschedule)\s+(?:the\s+)?(?:task|todo|item)?\s*(?:called|named)?\s*(.+?)\s+to\s+(.+)/i,
      /^(?:rename|change the name of)\s+(?:the\s+)?(?:task|todo|item)?\s*(.+?)\s+to\s+(.+)/i,
    ],
    
    // List tasks patterns
    list: [
      /^(?:show|list|display|what are|tell me)\s+(?:all\s+)?(?:my\s+)?(?:tasks|todos|items)/i,
      /^(?:what do i have to do|what'?s on my list)/i,
    ],
    
    // Clear completed tasks
    clearCompleted: [
      /^(?:clear|delete|remove)\s+(?:all\s+)?(?:completed|finished|done)\s+(?:tasks|todos|items)/i,
    ],
    
    // Navigation
    navigate: [
      /^(?:go|navigate|take me|open)\s+(?:to\s+)?(?:the\s+)?(home|dashboard|workspace|tasks|analytics|stats|statistics)/i,
      /^(?:show|view)\s+(?:me\s+)?(?:the\s+)?(analytics|stats|statistics|dashboard)/i,
    ],
    
    // UI Modals
    openModal: [
      /^(?:open|show)\s+(?:the\s+)?(?:new\s+task|task\s+creation)\s+(?:popup|modal|dialog|window)/i,
      /^(?:create\s+a\s+task\s+manually|add\s+task\s+manually)/i,
    ],
    
    // Filtering
    setFilter: [
      /^(?:show|filter|view)\s+(?:by\s+)?(?:only\s+)?(all|today|overdue)\s+(?:tasks|todos)?/i,
      /^(?:show\s+me)\s+(all|today'?s|overdue)\s+(?:tasks|todos)?/i,
    ],
    
    // Search
    search: [
      /^(?:search|find|look\s+for)\s+(?:for\s+)?(.+)/i,
    ],
  };
  
  // Check for add command
  for (const pattern of commandPatterns.add) {
    const match = speech.match(pattern);
    if (match) {
      const taskText = match[1]?.trim();
      if (taskText && taskText.length > 1) {
        // Use existing parseTaskFromSpeech for detailed parsing
        const parsed = parseTaskFromSpeech(speech);
        
        return {
          type: 'add',
          taskName: parsed.taskName,
          updates: {
            title: parsed.taskName,
            priority: parsed.priority,
            deadline: parsed.deadline,
          },
          confidence: parsed.confidence,
          originalText: speech,
        };
      }
    }
  }
  
  // Check for delete command
  for (const pattern of commandPatterns.delete) {
    const match = speech.match(pattern);
    if (match) {
      const identifier = match[1]?.trim();
      if (identifier && identifier.length > 1) {
        return {
          type: 'delete',
          taskIdentifier: identifier,
          confidence: 'high',
          originalText: speech,
        };
      }
    }
  }
  
  // Check for complete command
  for (const pattern of commandPatterns.complete) {
    const match = speech.match(pattern);
    if (match) {
      const identifier = match[1]?.trim();
      if (identifier && identifier.length > 1) {
        return {
          type: 'complete',
          taskIdentifier: identifier,
          confidence: 'high',
          originalText: speech,
        };
      }
    }
  }
  
  // Check for uncomplete command
  for (const pattern of commandPatterns.uncomplete) {
    const match = speech.match(pattern);
    if (match) {
      const identifier = match[1]?.trim();
      if (identifier && identifier.length > 1) {
        return {
          type: 'uncomplete',
          taskIdentifier: identifier,
          confidence: 'high',
          originalText: speech,
        };
      }
    }
  }
  
  // Check for update command
  for (const pattern of commandPatterns.update) {
    const match = speech.match(pattern);
    if (match) {
      const identifier = match[1]?.trim();
      const newValue = match[2]?.trim();
      
      if (identifier && newValue && identifier.length > 1 && newValue.length > 1) {
        const dateTimeResult = detectDateTimeFromText(newValue);
        
        // If newValue is a date/time, update deadline
        if (dateTimeResult.detectedDate && (dateTimeResult.confidence === 'high' || dateTimeResult.confidence === 'medium')) {
          return {
            type: 'update',
            taskIdentifier: identifier,
            updates: {
              deadline: dateTimeResult.detectedDate,
            },
            confidence: 'high',
            originalText: speech,
          };
        }
        
        // Otherwise, assume it's a rename
        return {
          type: 'update',
          taskIdentifier: identifier,
          updates: {
            title: newValue,
          },
          confidence: 'high',
          originalText: speech,
        };
      }
    }
  }
  
  // Check for list command
  for (const pattern of commandPatterns.list) {
    const match = speech.match(pattern);
    if (match) {
      return {
        type: 'list',
        confidence: 'high',
        originalText: speech,
      };
    }
  }
  
  // Check for clear completed command
  for (const pattern of commandPatterns.clearCompleted) {
    const match = speech.match(pattern);
    if (match) {
      return {
        type: 'clear_completed',
        confidence: 'high',
        originalText: speech,
      };
    }
  }

  // Check for navigate
  for (const pattern of commandPatterns.navigate) {
    const match = speech.match(pattern);
    if (match) {
      const dest = match[1]?.toLowerCase();
      let route = '/home';
      if (['analytics', 'stats', 'statistics'].includes(dest)) {
        route = '/stats';
      }
      return {
        type: 'navigate',
        destination: route,
        confidence: 'high',
        originalText: speech,
      };
    }
  }

  // Check for openModal
  for (const pattern of commandPatterns.openModal) {
    const match = speech.match(pattern);
    if (match) {
      return {
        type: 'open_modal',
        modalName: 'new_task',
        confidence: 'high',
        originalText: speech,
      };
    }
  }

  // Check for setFilter
  for (const pattern of commandPatterns.setFilter) {
    const match = speech.match(pattern);
    if (match) {
      let filterRaw = match[1]?.toLowerCase().replace("'s", "");
      let filterId = 'all';
      if (filterRaw.includes('today')) filterId = 'today';
      if (filterRaw.includes('overdue')) filterId = 'overdue';
      return {
        type: 'set_filter',
        filterId,
        confidence: 'high',
        originalText: speech,
      };
    }
  }

  // Check for search
  for (const pattern of commandPatterns.search) {
    const match = speech.match(pattern);
    if (match) {
      const query = match[1]?.trim();
      if (query) {
        return {
          type: 'search',
          searchQuery: query,
          confidence: 'high',
          originalText: speech,
        };
      }
    }
  }
  
  // If no pattern matched, default to add command
  // This maintains backward compatibility
  const parsed = parseTaskFromSpeech(speech);
  
  return {
    type: 'add',
    taskName: parsed.taskName,
    updates: {
      title: parsed.taskName,
      priority: parsed.priority,
      deadline: parsed.deadline,
    },
    confidence: 'low',
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
