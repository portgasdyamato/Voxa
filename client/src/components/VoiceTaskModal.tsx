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
  ListTodo, History, LayoutGrid, Mic, Command, X, Calendar, Tag, AlertCircle, Quote, Radio, AudioLines, Clock, Workflow, ArrowRight
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
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border border-white/[0.22] bg-[#010101] p-10 text-center space-y-8 shadow-[0_45px_100px_rgba(0,0,0,0.95)]">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <div className="space-y-4">
             <DialogTitle className="text-white text-3xl font-black tracking-tight leading-none italic uppercase">Incompatible Protocol</DialogTitle>
             <DialogDescription className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] italic leading-relaxed">
               Voice input requires a high-fidelity browser environment with persistent microphone synchronization.
             </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border border-white/[0.22] bg-[#010101] backdrop-blur-[40px] shadow-[0_45px_100px_rgba(0,0,0,0.95)] flex flex-col max-h-[90vh] translate-y-[-50%] rounded-[2.5rem]">
         <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />
         <div className="absolute inset-0 bg-white/[0.04] pointer-events-none" />
         
        <DialogHeader className="px-10 pt-12 pb-10 border-b border-white/[0.05] flex-shrink-0 relative z-10 overflow-hidden">
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none">
            <Radio className="w-80 h-80 text-blue-400 rotate-12" />
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <motion.div 
               animate={{ 
                 scale: isListening ? [1, 1.15, 1] : 1,
                 opacity: isListening ? [0.6, 1, 0.6] : 1
               }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
               className={cn(
                 "w-16 h-16 rounded-[1.75rem] flex items-center justify-center transition-all duration-700 flex-shrink-0 border",
                 isListening ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]" : "bg-white/[0.05] border-white/10 text-white/10"
               )}
            >
              <Mic className="w-8 h-8" />
            </motion.div>
            <div className="space-y-1">
              <DialogTitle className="text-[2rem] font-black tracking-tight text-white leading-none">
                {isListening ? 'Synchronizing Voice' : 'Processing Input'}
              </DialogTitle>
              <DialogDescription className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] italic leading-none">
                {isListening ? "Awaiting operational voice command protocol" : "Analyzing neural voice signature"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-10 py-12 space-y-10 overflow-y-auto flex-1 no-scrollbar relative z-10">
          {!showTranscription ? (
            <div className="flex flex-col items-center gap-12">
              <div className="relative flex items-center justify-center w-full h-[300px]">
                <AnimatePresence mode="wait">
                  {isListening ? (
                    <motion.div 
                      key="talk"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative w-full h-full flex items-center justify-center"
                    >
                      <img 
                        src={heroGif} 
                        alt="Listening..." 
                        className="w-[450px] h-[450px] object-contain opacity-80 mix-blend-screen scale-110"
                      />
                      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#010101] opacity-60" />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="stop"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative w-full h-full flex items-center justify-center"
                    >
                      <img 
                        src={processGif} 
                        alt="Processing..." 
                        className="w-[450px] h-[450px] object-contain opacity-40 mix-blend-screen"
                      />
                      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#010101] opacity-60" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-white/10 text-[11px] font-black uppercase tracking-[0.6em] italic text-center animate-pulse">
                System Acknowledging Neural Input...
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 px-4 italic">Neural Output</Label>
                <div className="p-8 rounded-[1.75rem] bg-white/[0.04] border border-white/10 text-2xl font-black text-white italic tracking-tight leading-relaxed">
                   "{transcript}"
                </div>
              </div>

              {parsedTaskName && (
                <div className="p-10 rounded-[2.5rem] border border-blue-500/20 bg-blue-500/[0.03] space-y-8 relative overflow-hidden group">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                  <div className="flex items-center gap-4 text-blue-400">
                    <Workflow className="w-5 h-5 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Protocol Identified</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">Operational Payload:</p>
                    <h3 className="text-[2.5rem] font-black text-white leading-none tracking-tight">"{parsedTaskName}"</h3>
                  </div>
                  {detectedDate && (
                    <div className="flex items-center gap-4 pt-8 border-t border-white/[0.05]">
                       <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                          <Clock className="w-5 h-5 text-blue-400" />
                       </div>
                       <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 italic">Synchronized: {detectedDate}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="px-10 py-10 border-t border-white/[0.05] bg-white/[0.02] flex gap-6 shrink-0 relative z-10">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-14 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] italic text-white/20 hover:text-white hover:bg-white/[0.04] transition-all border border-white/[0.1]"
          >
            Abort
          </Button>
          <Button
            onClick={() => {
               if (isListening) stopListening();
               else handleExecuteCommand();
            }}
            disabled={!transcript && !isListening}
            className="flex-[2] h-14 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] italic bg-white/[0.08] border border-white/[0.22] backdrop-blur-[40px] text-white hover:bg-white/[0.12] shadow-2xl disabled:opacity-20 transition-all flex items-center justify-center gap-4 group"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            {isListening ? 'End Synch' : 'Commit Payload'}
            {!isListening && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
