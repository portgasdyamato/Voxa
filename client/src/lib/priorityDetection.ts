export function detectPriority(text: string): 'high' | 'medium' | 'low' {
  const lowerText = text.toLowerCase();
  
  // High priority keywords
  const highPriorityWords = [
    'urgent', 'asap', 'immediately', 'emergency', 'critical', 'important',
    'deadline', 'rush', 'priority', 'crucial', 'vital', 'essential'
  ];
  
  // Low priority keywords
  const lowPriorityWords = [
    'later', 'eventually', 'sometime', 'when possible', 'no rush',
    'low priority', 'optional', 'if time permits', 'nice to have'
  ];
  
  // Check for high priority
  if (highPriorityWords.some(word => lowerText.includes(word))) {
    return 'high';
  }
  
  // Check for low priority
  if (lowPriorityWords.some(word => lowerText.includes(word))) {
    return 'low';
  }
  
  // Default to medium priority
  return 'medium';
}
