import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUpdateTask, useDeleteTask, useCreateTask } from '@/hooks/useTasks';
import { Task } from '@/types/task';
import { parseTaskFromSpeech } from '@/lib/dateDetection';

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceCommandResult {
  command: string;
  action: 'mark_done' | 'mark_pending' | 'delete' | 'show_tasks' | 'list_pending' | 'list_completed' | 'add_task' | 'create_task' | 'unknown';
  taskName?: string;
  taskDescription?: string;
  priority?: 'high' | 'medium' | 'low';
  deadline?: Date | null;
  confidence: number;
}

export function useVoiceCommands(tasks: Task[]) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<VoiceCommandResult | null>(null);
  
  const { toast } = useToast();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createTask = useCreateTask();

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice commands not supported",
        description: "Your browser doesn't support speech recognition for voice commands.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';
    
    recognitionInstance.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening for command...",
        description: "Say a command like 'Mark laundry as done' or 'Show me today's tasks'",
        duration: 3000,
      });
    };
    
    recognitionInstance.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      processVoiceCommand(result);
    };
    
    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Voice command error",
        description: "Could not understand the command. Please try again.",
        variant: "destructive",
      });
    };
    
    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    setRecognition(recognitionInstance);
    
    return () => {
      recognitionInstance.stop();
    };
  }, [toast]);

  // Parse voice command and extract intent
  const parseVoiceCommand = useCallback((transcript: string): VoiceCommandResult => {
    const text = transcript.toLowerCase().trim();
    
    // Command patterns with more natural variations
    const patterns = [
      // Task creation patterns
      {
        regex: /^(add|create|new|make|save)\s+(a\s+)?(task|todo|item)\s+(.+)$/,
        action: 'add_task' as const,
        taskNameIndex: 4
      },
      {
        regex: /^(add|create|new|make|save)\s+(.+?)\s+(to\s+my\s+)?(task\s+list|tasks|todo\s+list)$/,
        action: 'add_task' as const,
        taskNameIndex: 2
      },
      {
        regex: /^(add|create|new|make|save)\s+(urgent|important|critical|high\s+priority)\s+(task|todo|item)\s+(.+)$/,
        action: 'add_task' as const,
        taskNameIndex: 4
      },
      {
        regex: /^(remind\s+me\s+to|i\s+need\s+to|don'?t\s+forget\s+to)\s+(.+)$/,
        action: 'add_task' as const,
        taskNameIndex: 2
      },
      {
        regex: /^(schedule|plan)\s+(.+)$/,
        action: 'add_task' as const,
        taskNameIndex: 2
      },
      {
        regex: /^(save|record|note|write\s+down)\s+(.+)$/,
        action: 'add_task' as const,
        taskNameIndex: 2
      },
      // Task completion patterns
      {
        regex: /^(mark|set|complete|finish|done|check\s+off)\s+(.+?)\s+(as\s+)?(done|complete|completed|finished)$/,
        action: 'mark_done' as const,
        taskNameIndex: 2
      },
      {
        regex: /^(complete|finish|done\s+with)\s+(.+)$/,
        action: 'mark_done' as const,
        taskNameIndex: 2
      },
      {
        regex: /^(check\s+off)\s+(.+)$/,
        action: 'mark_done' as const,
        taskNameIndex: 2
      },
      {
        regex: /^(mark|set)\s+(.+?)\s+(as\s+)?(pending|undone|incomplete|not\s+done|unfinished)$/,
        action: 'mark_pending' as const,
        taskNameIndex: 2
      },
      // Task deletion patterns
      {
        regex: /^(delete|remove|cancel|eliminate)\s+(.+?)$/,
        action: 'delete' as const,
        taskNameIndex: 2
      },
      // Task viewing patterns
      {
        regex: /^(show|list|display|tell\s+me)\s+(me\s+)?(today'?s?\s+tasks?|tasks?\s+for\s+today|my\s+tasks?\s+today)$/,
        action: 'show_tasks' as const
      },
      {
        regex: /^(show|list|display|tell\s+me)\s+(me\s+)?(pending|incomplete|unfinished|outstanding)\s+tasks?$/,
        action: 'list_pending' as const
      },
      {
        regex: /^(show|list|display|tell\s+me)\s+(me\s+)?(completed|finished|done)\s+tasks?$/,
        action: 'list_completed' as const
      },
      {
        regex: /^(what\s+are\s+my|show\s+me\s+my|list\s+my|tell\s+me\s+my)\s+(pending|incomplete|unfinished|outstanding)\s+tasks?$/,
        action: 'list_pending' as const
      },
      {
        regex: /^(what\s+are\s+my|show\s+me\s+my|list\s+my|tell\s+me\s+my)\s+tasks?$/,
        action: 'show_tasks' as const
      },
      {
        regex: /^(what\s+do\s+i\s+have\s+to\s+do|what'?s\s+on\s+my\s+list)(\s+today)?$/,
        action: 'show_tasks' as const
      }
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern.regex);
      if (match) {
        const taskName = pattern.taskNameIndex ? match[pattern.taskNameIndex] : undefined;
        
        // For task creation, also detect priority from the task name
        let priority: 'high' | 'medium' | 'low' = 'medium';
        let cleanTaskName = taskName;
        
        if (pattern.action === 'add_task' && taskName) {
          // Use enhanced natural language parsing for task creation on the full transcript
          const parsedTask = parseTaskFromSpeech(transcript);
          
          return {
            command: transcript,
            action: pattern.action,
            taskName: parsedTask.taskName || taskName,
            priority: parsedTask.priority,
            deadline: parsedTask.deadline,
            confidence: parsedTask.confidence === 'high' ? 0.9 : parsedTask.confidence === 'medium' ? 0.7 : 0.5
          };
        }
        
        return {
          command: transcript,
          action: pattern.action,
          taskName: cleanTaskName,
          priority,
          deadline: null,
          confidence: 0.9
        };
      }
    }

    return {
      command: transcript,
      action: 'unknown',
      deadline: null,
      confidence: 0.1
    };
  }, []);

  // Find task by name using improved fuzzy matching
  const findTaskByName = useCallback((taskName: string): Task | null => {
    const name = taskName.toLowerCase().trim();
    
    // Exact match first
    const exactMatch = tasks.find(task => 
      task.title.toLowerCase() === name
    );
    if (exactMatch) return exactMatch;
    
    // Clean up common speech recognition artifacts
    const cleanName = name
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
    
    // Exact match with cleaned name
    const cleanExactMatch = tasks.find(task => 
      task.title.toLowerCase().replace(/[^\w\s]/g, '').trim() === cleanName
    );
    if (cleanExactMatch) return cleanExactMatch;
    
    // Partial match - task title contains the spoken name
    const partialMatch = tasks.find(task => 
      task.title.toLowerCase().includes(name) || 
      task.title.toLowerCase().includes(cleanName)
    );
    if (partialMatch) return partialMatch;
    
    // Reverse partial match - spoken name contains task title
    const reversePartialMatch = tasks.find(task => {
      const taskTitle = task.title.toLowerCase();
      return name.includes(taskTitle) || cleanName.includes(taskTitle);
    });
    if (reversePartialMatch) return reversePartialMatch;
    
    // Word-based fuzzy match
    const words = cleanName.split(' ').filter(w => w.length > 2); // Only words longer than 2 chars
    const fuzzyMatch = tasks.find(task => {
      const taskWords = task.title.toLowerCase().split(' ').filter(w => w.length > 2);
      if (words.length === 0 || taskWords.length === 0) return false;
      
      // Check if at least 50% of words match
      const matchedWords = words.filter(word => 
        taskWords.some(taskWord => 
          taskWord.includes(word) || 
          word.includes(taskWord) ||
          levenshteinDistance(word, taskWord) <= 1
        )
      );
      
      return matchedWords.length >= Math.ceil(words.length * 0.5);
    });
    
    return fuzzyMatch || null;
  }, [tasks]);

  // Simple Levenshtein distance for fuzzy string matching
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[len2][len1];
  };

  // Process the voice command
  const processVoiceCommand = useCallback((transcript: string) => {
    const commandResult = parseVoiceCommand(transcript);
    setLastCommand(commandResult);
    
    switch (commandResult.action) {
      case 'add_task':
      case 'create_task':
        if (commandResult.taskName) {
          // Check if task with similar name already exists
          const existingTask = findTaskByName(commandResult.taskName);
          if (existingTask) {
            toast({
              title: "Similar task already exists",
              description: `A task named "${existingTask.title}" already exists. Try using a different name.`,
              variant: "destructive",
            });
            return;
          }

          const taskData = {
            title: commandResult.taskName,
            priority: commandResult.priority || 'medium' as const,
            reminderEnabled: false,
            ...(commandResult.deadline && { 
              dueDate: commandResult.deadline.toISOString(),
              reminderEnabled: true 
            })
          };
          
          createTask.mutate(taskData, {
            onSuccess: (newTask) => {
              const priorityText = commandResult.priority === 'high' ? ' with high priority' : 
                                  commandResult.priority === 'low' ? ' with low priority' : '';
              const deadlineText = commandResult.deadline ? 
                ` with deadline ${commandResult.deadline.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  hour: commandResult.deadline.getHours() !== 23 ? 'numeric' : undefined,
                  minute: commandResult.deadline.getMinutes() !== 59 ? '2-digit' : undefined
                })}` : '';
              
              toast({
                title: "Task created successfully! ✅",
                description: `"${commandResult.taskName}" has been added to your tasks${priorityText}${deadlineText}.`,
                duration: 5000,
              });
            },
            onError: (error) => {
              console.error('Failed to create task:', error);
              toast({
                title: "Failed to create task",
                description: "Could not add the task. Please try again.",
                variant: "destructive",
              });
            }
          });
        } else {
          toast({
            title: "Task name missing",
            description: "Please specify what task you want to add. For example: 'Add task buy groceries'",
            variant: "destructive",
          });
        }
        break;
        
      case 'mark_done':
        if (commandResult.taskName) {
          const task = findTaskByName(commandResult.taskName);
          if (task) {
            if (task.completed) {
              toast({
                title: "Task already completed",
                description: `"${task.title}" is already marked as done.`,
              });
            } else {
              updateTask.mutate({
                id: task.id,
                updates: { completed: true }
              }, {
                onSuccess: () => {
                  toast({
                    title: "Task completed!",
                    description: `"${task.title}" has been marked as done.`,
                  });
                }
              });
            }
          } else {
            toast({
              title: "Task not found",
              description: `Could not find a task named "${commandResult.taskName}".`,
              variant: "destructive",
            });
          }
        }
        break;
        
      case 'mark_pending':
        if (commandResult.taskName) {
          const task = findTaskByName(commandResult.taskName);
          if (task) {
            if (!task.completed) {
              toast({
                title: "Task already pending",
                description: `"${task.title}" is already marked as pending.`,
              });
            } else {
              updateTask.mutate({
                id: task.id,
                updates: { completed: false }
              }, {
                onSuccess: () => {
                  toast({
                    title: "Task marked as pending",
                    description: `"${task.title}" has been marked as pending.`,
                  });
                }
              });
            }
          } else {
            toast({
              title: "Task not found",
              description: `Could not find a task named "${commandResult.taskName}".`,
              variant: "destructive",
            });
          }
        }
        break;
        
      case 'delete':
        if (commandResult.taskName) {
          const task = findTaskByName(commandResult.taskName);
          if (task) {
            deleteTask.mutate(task.id, {
              onSuccess: () => {
                toast({
                  title: "Task deleted",
                  description: `"${task.title}" has been deleted.`,
                });
              }
            });
          } else {
            toast({
              title: "Task not found",
              description: `Could not find a task named "${commandResult.taskName}".`,
              variant: "destructive",
            });
          }
        }
        break;
        
      case 'show_tasks':
        const todayTasks = tasks.filter(task => {
          const today = new Date();
          const taskDate = new Date(task.createdAt);
          return taskDate.toDateString() === today.toDateString();
        });
        const pendingTodayTasks = todayTasks.filter(task => !task.completed);
        const completedTodayTasks = todayTasks.filter(task => task.completed);
        
        toast({
          title: "Today's tasks",
          description: `${pendingTodayTasks.length} pending, ${completedTodayTasks.length} completed. ${pendingTodayTasks.length > 0 ? 'Pending: ' + pendingTodayTasks.slice(0, 3).map(t => t.title).join(', ') + (pendingTodayTasks.length > 3 ? '...' : '') : 'All tasks completed!'}`,
          duration: 6000,
        });
        break;
        
      case 'list_pending':
        const pendingTasks = tasks.filter(task => !task.completed);
        const priorityPending = pendingTasks.filter(task => task.priority === 'high');
        
        toast({
          title: "Pending tasks",
          description: `${pendingTasks.length} total pending${priorityPending.length > 0 ? `, ${priorityPending.length} high priority` : ''}. ${pendingTasks.length > 0 ? pendingTasks.slice(0, 3).map(t => t.title).join(', ') + (pendingTasks.length > 3 ? '...' : '') : 'No pending tasks!'}`,
          duration: 6000,
        });
        break;
        
      case 'list_completed':
        const completedTasks = tasks.filter(task => task.completed);
        const todayCompleted = completedTasks.filter(task => {
          const today = new Date();
          const taskDate = task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdAt);
          return taskDate.toDateString() === today.toDateString();
        });
        
        toast({
          title: "Completed tasks",
          description: `${completedTasks.length} total completed${todayCompleted.length > 0 ? `, ${todayCompleted.length} completed today` : ''}. ${completedTasks.length > 0 ? completedTasks.slice(0, 3).map(t => t.title).join(', ') + (completedTasks.length > 3 ? '...' : '') : 'No completed tasks yet.'}`,
          duration: 6000,
        });
        break;
        
      default:
        toast({
          title: "Command not recognized",
          description: "Try commands like: 'Add task buy groceries', 'Mark laundry as done', or 'Show me today's tasks'.",
          variant: "destructive",
        });
    }
  }, [parseVoiceCommand, findTaskByName, updateTask, deleteTask, tasks, toast]);

  // Start listening for voice commands
  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      recognition.start();
    }
  }, [recognition, isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  return {
    isListening,
    transcript,
    lastCommand,
    startListening,
    stopListening,
    isSupported: !!recognition
  };
}
