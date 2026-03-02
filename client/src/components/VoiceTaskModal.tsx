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
  ListTodo, History, LayoutGrid, Mic, Command, X, Calendar, Tag, AlertCircle, Quote, Radio, AudioLines, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { parseVoiceCommand } from '@/lib/voiceCommands';
import { parseTaskFromSpeech } from '@/lib/dateDetection';
import heroGif from '@/assets/hero.gif';
import processGif from '@/assets/process.gif';

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
      }, 1500);
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
        <DialogContent className="sm:max-w-sm rounded-2xl border border-white/[0.08] bg-[#0a0c10] p-6">
          <DialogTitle className="text-white text-lg font-black">Voice Not Supported</DialogTitle>
          <DialogDescription className="text-white/40 text-sm">
            Voice input requires a browser with microphone support (e.g. Chrome).
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_40px_80px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] translate-y-[-50%]">
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-border bg-card flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none">
            <Radio className="w-64 h-64 text-primary animate-pulse" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <motion.div 
               animate={{ 
                 scale: isListening ? [1, 1.15, 1] : 1,
                 opacity: isListening ? [0.7, 1, 0.7] : 1
               }}
               transition={{ duration: 1.5, repeat: Infinity }}
               className={cn(
                 "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-700 flex-shrink-0",
                 isListening ? "bg-primary shadow-primary/30" : "bg-white/5 border border-white/10 text-white/30"
               )}
            >
              <Mic className="w-5 h-5" />
            </motion.div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-foreground">
                {isListening ? 'Listening...' : 'Processing...'}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                {isListening ? "Speak clearly — say a task or command." : "Analyzing your voice input."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {!showTranscription ? (
            <div className="flex flex-col items-center py-8 gap-6">
              <div className="relative flex items-center justify-center w-full h-32 mt-4">
                <AnimatePresence mode="wait">
                  {isListening ? (
                    <motion.img 
                      key="talk"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      src={heroGif} 
                      alt="Listening..." 
                      className="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] object-contain"
                    />
                  ) : (
                    <motion.img 
                      key="stop"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      src={processGif} 
                      alt="Processing..." 
                      className="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] object-contain opacity-80 mix-blend-screen"
                    />
                  )}
                </AnimatePresence>
              </div>
              <p className="text-white/30 text-sm font-semibold italic mt-6">
                Listening — speak your task or command...
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">Heard</Label>
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] italic text-base font-bold text-white">
                   "{transcript}"
                </div>
              </div>

              {parsedTaskName && (
                <div className="p-5 rounded-2xl border border-primary/15 bg-primary/5 space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <AudioLines className="w-5 h-5 animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Task Detected</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Will add:</p>
                    <h3 className="text-2xl font-black text-white leading-tight">"{parsedTaskName}"</h3>
                  </div>
                  {detectedDate && (
                    <div className="flex items-center gap-3 pt-3 border-t border-primary/10">
                       <div className="p-1.5 rounded-lg bg-primary/20">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                       </div>
                       <span className="text-xs font-bold text-white/50">Due: {detectedDate}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/[0.06] bg-[#0a0a0a] flex gap-3 shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11 rounded-xl font-bold text-sm text-white/40 hover:text-white hover:bg-white/[0.06] transition-all border border-white/[0.06]"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
               if (isListening) stopListening();
               else handleExecuteCommand();
            }}
            disabled={!transcript && !isListening}
            className="flex-[2] h-11 rounded-xl font-black text-sm bg-primary text-white shadow-lg shadow-primary/30 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {isListening ? 'Stop Recording' : 'Save Task'}
            {!isListening && <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
