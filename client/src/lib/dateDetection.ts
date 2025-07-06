// Date detection utility for voice input
// Detects dates and times from natural language text

export interface DateDetectionResult {
  detectedDate: Date | null;
  dateText: string;
  timeText: string;
  confidence: 'high' | 'medium' | 'low';
  originalText: string;
  cleanedText: string; // Text with date/time removed
}

export interface TimeDetectionResult {
  detectedTime: { hours: number; minutes: number } | null;
  timeText: string;
  confidence: 'high' | 'medium' | 'low';
  originalText: string;
}

export function detectTimeFromText(text: string): TimeDetectionResult {
  const lowerText = text.toLowerCase();
  
  // Simple, robust time patterns
  const timePatterns = [
    // 12-hour format with minutes (e.g., "3:30 PM", "10:15 AM")
    {
      pattern: /\b(?:at\s+)?(\d{1,2}):(\d{2})\s*(am|pm)\b/i,
      parse: (match: RegExpMatchArray) => {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const ampm = match[3].toLowerCase();
        
        if (hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59) {
          if (ampm === 'pm' && hours !== 12) hours += 12;
          else if (ampm === 'am' && hours === 12) hours = 0;
          return { hours, minutes };
        }
        return null;
      },
      confidence: 'high' as const
    },
    
    // 12-hour format without minutes (e.g., "3 PM", "10 AM")
    {
      pattern: /\b(?:at\s+)?(\d{1,2})\s*(am|pm)\b/i,
      parse: (match: RegExpMatchArray) => {
        let hours = parseInt(match[1]);
        const ampm = match[2].toLowerCase();
        
        if (hours >= 1 && hours <= 12) {
          if (ampm === 'pm' && hours !== 12) hours += 12;
          else if (ampm === 'am' && hours === 12) hours = 0;
          return { hours, minutes: 0 };
        }
        return null;
      },
      confidence: 'high' as const
    },
    
    // 24-hour format (e.g., "15:30", "09:00")
    {
      pattern: /\b(?:at\s+)?(\d{1,2}):(\d{2})\b/i,
      parse: (match: RegExpMatchArray) => {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          return { hours, minutes };
        }
        return null;
      },
      confidence: 'medium' as const
    },
    
    // Just a number with "at" (e.g., "at 5", "at 17")
    {
      pattern: /\bat\s+(\d{1,2})\b/i,
      parse: (match: RegExpMatchArray) => {
        const hours = parseInt(match[1]);
        if (hours >= 0 && hours <= 23) {
          return { hours, minutes: 0 };
        }
        return null;
      },
      confidence: 'medium' as const
    },
    
    // Named times
    {
      pattern: /\b(?:at\s+)?(?:noon|midday)\b/i,
      parse: () => ({ hours: 12, minutes: 0 }),
      confidence: 'high' as const
    },
    {
      pattern: /\bmidnight\b/i,
      parse: () => ({ hours: 0, minutes: 0 }),
      confidence: 'high' as const
    },
    {
      pattern: /\btonight\b/i,
      parse: () => ({ hours: 20, minutes: 0 }),
      confidence: 'medium' as const
    },
    {
      pattern: /\b(?:in\s+the\s+)?morning\b/i,
      parse: () => ({ hours: 9, minutes: 0 }),
      confidence: 'medium' as const
    },
    {
      pattern: /\b(?:in\s+the\s+)?afternoon\b/i,
      parse: () => ({ hours: 14, minutes: 0 }),
      confidence: 'medium' as const
    },
    {
      pattern: /\b(?:in\s+the\s+)?evening\b/i,
      parse: () => ({ hours: 18, minutes: 0 }),
      confidence: 'medium' as const
    },
    
    // O'clock format
    {
      pattern: /\b(?:at\s+)?(\d{1,2})\s*o'?clock\b/i,
      parse: (match: RegExpMatchArray) => {
        const hours = parseInt(match[1]);
        if (hours >= 1 && hours <= 12) {
          return { hours, minutes: 0 };
        }
        return null;
      },
      confidence: 'high' as const
    }
  ];

  for (const patternConfig of timePatterns) {
    const match = lowerText.match(patternConfig.pattern);
    if (match) {
      const detectedTime = patternConfig.parse(match);
      if (detectedTime) {
        return {
          detectedTime,
          timeText: match[0],
          confidence: patternConfig.confidence,
          originalText: text
        };
      }
    }
  }

  return {
    detectedTime: null,
    timeText: '',
    confidence: 'low',
    originalText: text
  };
}

export function detectDateFromText(text: string): DateDetectionResult {
  const lowerText = text.toLowerCase();
  const now = new Date();
  
  // Common date patterns - more specific patterns first
  const patterns = [
    // Specific compound phrases
    { pattern: /\b(day after tomorrow)\b/i, days: 2, confidence: 'high' as const },
    { pattern: /\b(by the end of the week|end of the week)\b/i, dayOfWeek: 5, confidence: 'medium' as const },
    { pattern: /\b(beginning of next week)\b/i, dayOfWeek: 1, nextWeek: true, confidence: 'medium' as const },
    
    // Today/Tomorrow/Yesterday
    { pattern: /\b(today|this afternoon|this evening|tonight)\b/i, days: 0, confidence: 'high' as const },
    { pattern: /\b(tomorrow|tmrw|tom)\b/i, days: 1, confidence: 'high' as const },
    { pattern: /\b(yesterday)\b/i, days: -1, confidence: 'high' as const },
    
    // Next week days (specific "next" patterns)
    { pattern: /\b(next monday)\b/i, dayOfWeek: 1, nextWeek: true, confidence: 'high' as const },
    { pattern: /\b(next tuesday|next tues)\b/i, dayOfWeek: 2, nextWeek: true, confidence: 'high' as const },
    { pattern: /\b(next wednesday|next wed)\b/i, dayOfWeek: 3, nextWeek: true, confidence: 'high' as const },
    { pattern: /\b(next thursday|next thurs)\b/i, dayOfWeek: 4, nextWeek: true, confidence: 'high' as const },
    { pattern: /\b(next friday|next fri)\b/i, dayOfWeek: 5, nextWeek: true, confidence: 'high' as const },
    { pattern: /\b(next saturday|next sat)\b/i, dayOfWeek: 6, nextWeek: true, confidence: 'high' as const },
    { pattern: /\b(next sunday|next sun)\b/i, dayOfWeek: 0, nextWeek: true, confidence: 'high' as const },
    
    // This week days
    { pattern: /\b(this monday|monday)\b/i, dayOfWeek: 1, confidence: 'high' as const },
    { pattern: /\b(this tuesday|tuesday|tues)\b/i, dayOfWeek: 2, confidence: 'high' as const },
    { pattern: /\b(this wednesday|wednesday|wed)\b/i, dayOfWeek: 3, confidence: 'high' as const },
    { pattern: /\b(this thursday|thursday|thurs)\b/i, dayOfWeek: 4, confidence: 'high' as const },
    { pattern: /\b(this friday|friday|fri)\b/i, dayOfWeek: 5, confidence: 'high' as const },
    { pattern: /\b(this saturday|saturday|sat)\b/i, dayOfWeek: 6, confidence: 'high' as const },
    { pattern: /\b(this sunday|sunday|sun)\b/i, dayOfWeek: 0, confidence: 'high' as const },
    
    // Weekend patterns
    { pattern: /\b(next weekend)\b/i, weekend: true, nextWeek: true, confidence: 'medium' as const },
    { pattern: /\b(this weekend)\b/i, weekend: true, confidence: 'medium' as const },
    
    // Relative dates
    { pattern: /\b(next week)\b/i, days: 7, confidence: 'medium' as const },
    { pattern: /\b(in (\d+) days?)\b/i, extractDays: true, confidence: 'high' as const },
    { pattern: /\b(in a week)\b/i, days: 7, confidence: 'medium' as const },
    { pattern: /\b(in two weeks?)\b/i, days: 14, confidence: 'medium' as const },
  ];

  let bestMatch: DateDetectionResult = {
    detectedDate: null,
    dateText: '',
    timeText: '',
    confidence: 'low',
    originalText: text,
    cleanedText: text
  };

  for (const patternConfig of patterns) {
    const match = lowerText.match(patternConfig.pattern);
    if (match) {
      let targetDate = new Date(now);
      let matchText = match[0];
      
      if (patternConfig.days !== undefined) {
        targetDate.setDate(now.getDate() + patternConfig.days);
      } else if (patternConfig.dayOfWeek !== undefined) {
        const currentDay = now.getDay();
        let daysUntilTarget = patternConfig.dayOfWeek - currentDay;
        
        if (daysUntilTarget <= 0) {
          daysUntilTarget += 7; // Next occurrence
        }
        
        if (patternConfig.nextWeek) {
          daysUntilTarget += 7;
        }
        
        targetDate.setDate(now.getDate() + daysUntilTarget);
      } else if (patternConfig.extractDays) {
        const daysMatch = match[2]; // The \d+ part from "in (\d+) days?"
        if (daysMatch) {
          targetDate.setDate(now.getDate() + parseInt(daysMatch));
        }
      } else if (patternConfig.weekend) {
        const currentDay = now.getDay();
        const daysUntilSaturday = 6 - currentDay;
        targetDate.setDate(now.getDate() + daysUntilSaturday + (patternConfig.nextWeek ? 7 : 0));
      }
      
      // Set time to end of day for deadlines
      targetDate.setHours(23, 59, 59, 999);
      
      bestMatch = {
        detectedDate: targetDate,
        dateText: matchText,
        timeText: '',
        confidence: patternConfig.confidence,
        originalText: text,
        cleanedText: text.replace(patternConfig.pattern, '').trim()
      };
      
      // Return the first high-confidence match
      if (patternConfig.confidence === 'high') {
        break;
      }
    }
  }

  return bestMatch;
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Tomorrow';
  } else if (diffInDays === -1) {
    return 'Yesterday';
  } else if (diffInDays > 1 && diffInDays <= 7) {
    return `In ${diffInDays} days`;
  } else if (diffInDays < -1 && diffInDays >= -7) {
    return `${Math.abs(diffInDays)} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

export function isOverdue(date: Date): boolean {
  const now = new Date();
  return date < now;
}

export function getDaysUntilDue(date: Date): number {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

export function getDeadlineColor(date: Date): string {
  const daysUntil = getDaysUntilDue(date);
  
  if (daysUntil < 0) {
    return 'bg-red-100 text-red-800 border-red-200'; // Overdue
  } else if (daysUntil === 0) {
    return 'bg-orange-100 text-orange-800 border-orange-200'; // Due today
  } else if (daysUntil <= 3) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Due soon
  } else {
    return 'bg-gray-100 text-gray-800 border-gray-200'; // Future
  }
}

// Combined date and time detection from natural language
export function detectDateTimeFromText(text: string): DateDetectionResult {
  const dateResult = detectDateFromText(text);
  const timeResult = detectTimeFromText(text);
  
  let finalDate = dateResult.detectedDate;
  let cleanedText = text;
  let timeText = '';
  
  // If we have both date and time, combine them
  if (dateResult.detectedDate && timeResult.detectedTime) {
    finalDate = new Date(dateResult.detectedDate);
    finalDate.setHours(timeResult.detectedTime.hours, timeResult.detectedTime.minutes, 0, 0);
    timeText = timeResult.timeText;
    
    // Remove both date and time from text
    cleanedText = text
      .replace(new RegExp(dateResult.dateText, 'gi'), '')
      .replace(new RegExp(timeResult.timeText, 'gi'), '')
      .replace(/\s+/g, ' ')
      .trim();
  } else if (dateResult.detectedDate) {
    // Only date detected
    finalDate = dateResult.detectedDate;
    cleanedText = dateResult.cleanedText;
  } else if (timeResult.detectedTime) {
    // Only time detected - assume today
    finalDate = new Date();
    finalDate.setHours(timeResult.detectedTime.hours, timeResult.detectedTime.minutes, 0, 0);
    timeText = timeResult.timeText;
    
    // Remove time from text
    cleanedText = text
      .replace(new RegExp(timeResult.timeText, 'gi'), '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  // Calculate confidence based on what we found
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (dateResult.detectedDate && timeResult.detectedTime) {
    confidence = dateResult.confidence === 'high' && timeResult.confidence === 'high' ? 'high' : 'medium';
  } else if (dateResult.detectedDate) {
    confidence = dateResult.confidence;
  } else if (timeResult.detectedTime) {
    confidence = timeResult.confidence;
  }
  
  return {
    detectedDate: finalDate,
    dateText: dateResult.dateText,
    timeText: timeText,
    confidence: confidence,
    originalText: text,
    cleanedText: cleanedText
  };
}

// Parse natural language for task creation from voice commands
export function parseTaskFromSpeech(speech: string): {
  taskName: string;
  deadline: Date | null;
  priority: 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
} {
  const dateTimeResult = detectDateTimeFromText(speech);
  
  // Extract priority from speech
  let priority: 'high' | 'medium' | 'low' = 'medium';
  const highPriorityWords = ['urgent', 'important', 'asap', 'immediately', 'critical', 'high priority'];
  const lowPriorityWords = ['later', 'when i have time', 'eventually', 'low priority', 'sometime'];
  
  const lowerSpeech = speech.toLowerCase();
  
  if (highPriorityWords.some(word => lowerSpeech.includes(word))) {
    priority = 'high';
  } else if (lowPriorityWords.some(word => lowerSpeech.includes(word))) {
    priority = 'low';
  }
  
  // Clean up the task name by removing priority keywords
  let taskName = dateTimeResult.cleanedText;
  
  // Remove priority keywords
  const allPriorityWords = [...highPriorityWords, ...lowPriorityWords];
  for (const word of allPriorityWords) {
    taskName = taskName.replace(new RegExp(`\\b${word}\\b`, 'gi'), '').trim();
  }
  
  // Remove common command prefixes and connecting words
  taskName = taskName
    .replace(/^(add|create|new|make|save|remind me to|i need to|don'?t forget to|schedule|plan|note|write down)\s+/gi, '')
    .replace(/^(task|todo|item)\s+/gi, '') // Remove task/todo/item at the beginning
    .replace(/\s+(task|todo|item)$/gi, '') // Remove task/todo/item at the end
    .replace(/\s+to\s+my\s+(task\s+list|tasks|todo\s+list)$/gi, '')
    .replace(/\s+by\s*$/gi, '') // Remove trailing "by"
    .replace(/\s+next\s*$/gi, '') // Remove trailing "next"
    .replace(/\s+o'clock\s*$/gi, '') // Remove trailing "o'clock"
    .replace(/\s+/g, ' ')
    .trim();
  
  // If taskName is still empty or too short, use a fallback
  if (!taskName || taskName.length < 2) {
    taskName = speech.replace(/^(add|create|new|make|save)\s+/gi, '').trim();
  }
  
  return {
    taskName: taskName,
    deadline: dateTimeResult.detectedDate,
    priority: priority,
    confidence: dateTimeResult.confidence
  };
}
