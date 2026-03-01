import { useState, useEffect, useRef } from 'react';
import { useCreateTask, useUpdateTask, useDeleteTask, useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Plus, Search, SlidersHorizontal, Layers, Activity, Zap, 
  ListTodo, History, LayoutGrid, Mic, Command, X, Calendar, Tag, AlertCircle, Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { parseVoiceCommand } from '@/lib/voiceCommands';
import { parseTaskFromSpeech } from '@/lib/dateDetection';

interface VoiceTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoiceTaskModal({ open, onOpenChange }: VoiceTaskModalProps) {
  const [showTranscription, setShowTranscription] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);
  const [deadlineInputValue, setDeadlineInputValue] = useState('');
  const [detectedDate, setDetectedDate] = useState<string | null>(null);
  const [parsedTaskName, setParsedTaskName] = useState('');
  const [detectedPriority, setDetectedPriority] = useState<'high' | 'medium' | 'low'>('medium');
  
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderType, setReminderType] = useState<string>('default');
  const [reminderTime, setReminderTime] = useState<string>('09:00');
  
  const { toast } = useToast();
  const { data: tasks } = useTasks();
  const { data: categories } = useCategories();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported
  } = useSpeechRecognition();

  useEffect(() => {
    if (!open) {
      stopListening();
      resetTranscript();
      setShowTranscription(false);
    } else {
      handleStartRecording();
    }
  }, [open]);

  useEffect(() => {
    if (!isListening && transcript) {
      setShowTranscription(true);
      const command = parseVoiceCommand(transcript);
      
      let finalCategoryId = '';
      let finalDeadline: Date | null = null;
      let finalTaskName = '';

      if (command.type === 'add') {
        const { taskName, deadline, priority } = parseTaskFromSpeech(transcript);
        finalTaskName = taskName || '';
        setParsedTaskName(finalTaskName);
        setDetectedPriority(priority);
        
        if (deadline) {
          finalDeadline = deadline;
          setSelectedDeadline(deadline);
          setDetectedDate(deadline.toLocaleString());
          const date = deadline;
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          setDeadlineInputValue(`${year}-${month}-${day}T${hours}:${minutes}`);
        } else {
          setDetectedDate(null);
        }
      } else if (command.type === 'delete' || command.type === 'complete' || command.type === 'uncomplete' || command.type === 'update') {
        finalTaskName = command.taskIdentifier || '';
        setParsedTaskName(finalTaskName);
      }
      
      const executionCategory = finalCategoryId || selectedCategory;
      const executionDeadline = finalDeadline !== null ? finalDeadline : selectedDeadline;
      const executionTaskName = finalTaskName || parsedTaskName;

      setTimeout(() => {
        handleExecuteCommand(executionCategory, executionDeadline, executionTaskName);
      }, 800);
    }
  }, [transcript, isListening]);

  const handleStartRecording = () => {
    resetTranscript();
    setShowTranscription(false);
    setSelectedCategory('');
    setSelectedDeadline(null);
    setDetectedDate(null);
    setDeadlineInputValue('');
    setParsedTaskName('');
    setDetectedPriority('medium');
    startListening();
  };

  const handleDeadlineChange = (value: string) => {
    setDeadlineInputValue(value);
    if (value) {
      const date = new Date(value);
      setSelectedDeadline(isNaN(date.getTime()) ? null : date);
    } else {
      setSelectedDeadline(null);
    }
  };

  const handleExecuteCommand = async (overrideCategory?: string, overrideDeadline?: Date | null, overrideTaskName?: string) => {
    const { executeVoiceCommand } = await import('@/lib/voiceCommandExecutor');
    await executeVoiceCommand(
      transcript,
      tasks || [],
      overrideCategory !== undefined ? overrideCategory : selectedCategory,
      overrideDeadline !== undefined ? overrideDeadline : selectedDeadline,
      reminderEnabled,
      reminderType,
      reminderTime,
      createTask,
      updateTask,
      deleteTask,
      toast,
      () => {
        onOpenChange(false);
        resetTranscript();
      },
      overrideTaskName !== undefined ? overrideTaskName : parsedTaskName,
      categories || []
    );
  };

  if (!isSupported) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-3xl border-border bg-background p-10">
          <DialogTitle>Speech Recognition Unsupported</DialogTitle>
          <DialogDescription>
            Your browser doesn't support speech recognition. Please try a modern browser like Chrome or Edge.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-[2.5rem] border border-border bg-background shadow-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="p-10 pb-6 border-b border-border/50 bg-muted/20 flex-shrink-0">
          <div className="flex items-center gap-6 relative z-10">
            <motion.div 
               animate={{ scale: isListening ? [1, 1.1, 1] : 1 }}
               transition={{ duration: 1, repeat: Infinity }}
               className={cn(
                 "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20",
                 isListening ? "bg-primary" : "bg-muted text-muted-foreground"
               )}
            >
              <Mic className="w-6 h-6" />
            </motion.div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {isListening ? 'Listening...' : 'Thinking...'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground font-medium mt-0.5">
                {isListening ? "Speak naturally to add or manage tasks." : "Understanding your request..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-10 py-10 space-y-10 overflow-y-auto flex-1 custom-scrollbar">
          {!showTranscription ? (
            <div className="flex flex-col items-center py-12 gap-10">
              <div className="relative flex items-center justify-center w-full h-24">
                <AnimatePresence>
                  {isListening && (
                    <div className="flex items-center gap-1.5 h-full">
                      {[1,2,3,4,5,6,7,8].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ height: [10, 40 + (Math.random() * 40), 10] }}
                          transition={{ duration: 0.4 + (Math.random() * 0.2), repeat: Infinity }}
                          className="w-1.5 bg-primary/40 rounded-full" 
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-muted-foreground/60 text-sm font-medium animate-pulse">
                "Remind me to call John tomorrow morning"
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">I Heard</Label>
                <div className="p-6 rounded-2xl bg-muted/30 border border-border italic text-xl font-medium leading-relaxed">
                   "{transcript}"
                </div>
              </div>

              {parsedTaskName && (
                <div className="p-6 rounded-2xl border border-primary/10 bg-primary/5 space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Zap className="w-5 h-5 fill-current" />
                    <span className="text-xs font-bold uppercase tracking-widest">Recommended Action</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Add new task:</p>
                    <h3 className="text-2xl font-bold tracking-tight">"{parsedTaskName}"</h3>
                  </div>
                  {detectedDate && (
                    <div className="flex items-center gap-3 pt-4 border-t border-primary/10">
                       <Calendar className="w-4 h-4 text-primary" />
                       <span className="text-xs font-bold text-foreground">Due: {detectedDate}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="p-10 border-t border-border bg-muted/20 flex gap-4 shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-14 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-500/10 hover:text-rose-600 transition-all border border-border/50"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
               if (isListening) stopListening();
               else handleExecuteCommand();
            }}
            disabled={!transcript && !isListening}
            className="flex-[2] h-14 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          >
            {isListening ? 'Finish Speaking' : 'Confirm Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
