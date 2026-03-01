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
  ListTodo, History, LayoutGrid, Mic, Command, X, Calendar, Tag, AlertCircle, Quote, Radio, AudioLines
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
        <DialogContent className="rounded-3xl border-white/[0.05] bg-[#050505] p-16">
          <DialogTitle className="text-white">Speech Interface Offline</DialogTitle>
          <DialogDescription className="text-white/20">
            Aural detection requires a Chromium-based telemetry core.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[3rem] border border-white/[0.05] bg-[#050505] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
        <DialogHeader className="p-16 pb-8 border-b border-white/[0.03] bg-[#0a0a0a] flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none">
            <Radio className="w-64 h-64 text-primary animate-pulse" />
          </div>
          <div className="flex items-center gap-8 relative z-10">
            <motion.div 
               animate={{ 
                 scale: isListening ? [1, 1.2, 1] : 1,
                 opacity: isListening ? [0.6, 1, 0.6] : 1
               }}
               transition={{ duration: 1.5, repeat: Infinity }}
               className={cn(
                 "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl inner-glow transition-all duration-700",
                 isListening ? "bg-primary shadow-primary/30" : "bg-white/5 border border-white/10 text-white/20"
               )}
            >
              <Mic className="w-8 h-8" />
            </motion.div>
            <div>
              <DialogTitle className="text-3xl font-black tracking-[-0.05em] text-white">
                {isListening ? 'Aural Decoding...' : 'Processing...'}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 mt-1 italic">
                {isListening ? "Capturing intentional acoustic waves." : "Synthesizing aural commands."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-16 py-16 space-y-12 overflow-y-auto flex-1 custom-scrollbar">
          {!showTranscription ? (
            <div className="flex flex-col items-center py-16 gap-12">
              <div className="relative flex items-center justify-center w-full h-32">
                <AnimatePresence>
                  {isListening && (
                    <div className="flex items-center gap-3 h-full">
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ 
                            height: [20, 80 + (Math.random() * 80), 20],
                            opacity: [0.2, 0.8, 0.2]
                          }}
                          transition={{ 
                            duration: 0.3 + (Math.random() * 0.4), 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-2 bg-primary/40 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.2)]" 
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-white/20 text-sm font-bold tracking-widest animate-pulse italic uppercase">
                Synchronizing with vocal frequency...
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 px-2 italic">Recovered Signal</Label>
                <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 italic text-2xl font-black tracking-tight leading-relaxed text-white">
                   "{transcript}"
                </div>
              </div>

              {parsedTaskName && (
                <div className="p-10 rounded-[3rem] border border-primary/10 bg-primary/5 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                    <Zap className="w-32 h-32 text-primary" />
                  </div>
                  <div className="flex items-center gap-4 text-primary">
                    <AudioLines className="w-6 h-6 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Synthesized Action</span>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] italic">Proposed Node:</p>
                    <h3 className="text-4xl font-black tracking-tight text-white leading-none">"{parsedTaskName}"</h3>
                  </div>
                  {detectedDate && (
                    <div className="flex items-center gap-4 pt-8 border-t border-primary/10">
                       <div className="p-2 rounded-lg bg-primary/20">
                          <Clock className="w-4 h-4 text-primary" />
                       </div>
                       <span className="text-xs font-black uppercase tracking-widest text-white/60">Target: {detectedDate}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="p-16 border-t border-white/[0.03] bg-[#0a0a0a] flex gap-6 shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-20 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] italic hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-white/[0.05]"
          >
            Purge Signal
          </Button>
          <Button
            onClick={() => {
               if (isListening) stopListening();
               else handleExecuteCommand();
            }}
            disabled={!transcript && !isListening}
            className="flex-[2] h-20 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] italic bg-primary text-white shadow-2xl shadow-primary/30 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 flex items-center gap-4">
               {isListening ? 'End Recording' : 'Commit Action'}
               {!isListening && <Plus className="w-4 h-4" />}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
