import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useCreateTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { detectPriority } from '@/lib/priorityDetection';
import { detectDateTimeFromText, formatRelativeDate, parseTaskFromSpeech } from '@/lib/dateDetection';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ReminderSettings } from '@/components/ReminderSettings';
import { Mic, X, Tag, Calendar, Clock, Sparkles, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VoiceTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoiceTaskModal({ open, onOpenChange }: VoiceTaskModalProps) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [showTranscription, setShowTranscription] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);
  const [deadlineInputValue, setDeadlineInputValue] = useState('');
  const [detectedDate, setDetectedDate] = useState<Date | null>(null);
  const [parsedTaskName, setParsedTaskName] = useState<string>('');
  const [detectedPriority, setDetectedPriority] = useState<'high' | 'medium' | 'low'>('medium');
  
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderType, setReminderType] = useState<'manual' | 'morning' | 'default'>('default');
  const [reminderTime, setReminderTime] = useState<string>('');
  
  const { toast } = useToast();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous: false,
    interimResults: false,
  });

  const createTask = useCreateTask();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  useEffect(() => {
    if (transcript && !isListening) {
      setShowTranscription(true);
      
      // Parse task details from speech
      const { taskName, deadline, priority } = parseTaskFromSpeech(transcript);
      setParsedTaskName(taskName);
      setDetectedPriority(priority);
      
      // Detect date and time
      const dateTimeResult = detectDateTimeFromText(transcript);
      if (dateTimeResult.detectedDate && dateTimeResult.confidence === 'high') {
        setDetectedDate(dateTimeResult.detectedDate);
        setSelectedDeadline(dateTimeResult.detectedDate);
        
        // Format for datetime-local input (YYYY-MM-DDTHH:MM)
        const date = dateTimeResult.detectedDate;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        setDeadlineInputValue(`${year}-${month}-${day}T${hours}:${minutes}`);
      } else {
        setDetectedDate(null);
      }
    }
  }, [transcript, isListening]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Voice System Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleStartRecording = () => {
    resetTranscript();
    setShowTranscription(false);
    setSelectedCategory('');
    setSelectedDeadline(null);
    setDetectedDate(null);
    setDeadlineInputValue('');
    setParsedTaskName('');
    setDetectedPriority('medium');
    setReminderEnabled(true);
    setReminderType('default');
    setReminderTime('');
    startListening();
  };

  const handleSaveTask = async () => {
    if (!transcript.trim()) {
      toast({ title: "No Voice Input", description: "Please speak a task to add.", variant: "destructive" });
      return;
    }

    // Parse the speech to extract task details
    const { taskName, deadline, priority, confidence } = parseTaskFromSpeech(transcript);
    
    // Use detected deadline if user hasn't manually set one
    const finalDeadline = selectedDeadline || deadline;
    
    // Validate task name
    if (!taskName || taskName.length < 2) {
      toast({ 
        title: "Invalid Task", 
        description: "Could not understand the task. Please try again.", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      await createTask.mutateAsync({
        title: taskName,
        description: undefined,
        priority,
        categoryId: selectedCategory && selectedCategory !== 'none' ? parseInt(selectedCategory) : undefined,
        dueDate: finalDeadline ? finalDeadline.toISOString() : undefined,
        reminderEnabled,
        reminderType,
        reminderTime: reminderType === 'manual' ? reminderTime : undefined,
      });

      toast({
        title: "Task Created",
        description: `Added "${taskName.slice(0, 40)}${taskName.length > 40 ? '...' : ''}" with ${priority} priority.`,
      });

      onOpenChange(false);
      resetTranscript();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create task. Please try again.", variant: "destructive" });
    }
  };

  const handleDeadlineChange = (value: string) => {
    setDeadlineInputValue(value);
    if (value) {
      const date = new Date(value);
      date.setHours(23, 59, 59, 999);
      setSelectedDeadline(date);
    } else {
      setSelectedDeadline(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-[3rem] border-2 border-border/40 bg-card/95 backdrop-blur-3xl shadow-3xl">
        <DialogHeader className="p-10 pb-6 relative overflow-hidden bg-primary/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30 ring-4 ring-primary/10">
              <Mic className="w-8 h-8" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black tracking-tighter">Voice Interface</DialogTitle>
              <DialogDescription className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">
                Neural capture enabled
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-10 py-8 space-y-8">
          {!showTranscription ? (
            <div className="flex flex-col items-center py-10 gap-10">
              <div className="relative">
                <motion.div 
                  animate={{ scale: isListening ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={cn(
                    "w-32 h-32 rounded-[3.5rem] flex items-center justify-center transition-all duration-500",
                    isListening ? "bg-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.4)]" : "bg-primary shadow-3xl"
                  )}
                >
                  {isListening ? (
                    <div className="relative flex items-center justify-center">
                       {[1,2,3].map(i => (
                         <motion.div 
                           key={i}
                           animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                           transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                           className="absolute w-full h-full rounded-[3.5rem] border-2 border-white/50" 
                         />
                       ))}
                       <Activity className="w-12 h-12 text-white" />
                    </div>
                  ) : (
                    <Mic className="w-12 h-12 text-white" />
                  )}
                </motion.div>
                {isListening && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                    {formatTime(recordingTime)}
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-2">
                <h4 className="text-xl font-bold tracking-tight">
                  {isListening ? 'Awaiting Audio Input...' : 'System Ready'}
                </h4>
                <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto">
                  {isListening ? 'Please state your objective clearly.' : 'Initialize neural capture to begin.'}
                </p>
              </div>

              <Button
                onClick={isListening ? stopListening : handleStartRecording}
                className={cn(
                  "h-16 w-full rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all",
                  isListening ? "bg-rose-500 text-white hover:bg-rose-600" : "bg-foreground text-background"
                )}
              >
                {isListening ? 'Terminate Recording' : 'Begin Capture'}
              </Button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="bg-muted/30 rounded-[2rem] p-8 border-2 border-border/40 relative group overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Sparkles className="w-12 h-12" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Transcription Engine Output</h4>
                <p className="text-sm text-muted-foreground mb-4">{transcript}</p>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Parsed Task</h4>
                <p className="text-xl font-bold leading-relaxed">{parsedTaskName || 'Processing...'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Tactical Class</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 bg-muted/30 font-bold px-6">
                      <SelectValue placeholder="General" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 shadow-2xl p-1 bg-popover/95">
                      <SelectItem value="none" className="rounded-xl font-bold py-3">Uncategorized</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl font-bold py-3">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Detected Priority</Label>
                  <div className={cn(
                    "h-14 rounded-2xl border-2 flex items-center px-6 gap-3 font-black text-xs uppercase tracking-widest",
                    detectedPriority === 'high' ? "bg-rose-500/5 border-rose-500/20 text-rose-500" :
                    detectedPriority === 'medium' ? "bg-amber-500/5 border-amber-500/20 text-amber-500" :
                    "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                  )}>
                    <div className="w-2 h-2 rounded-full bg-current" />
                    {detectedPriority} priority
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Execution Buffer
                </Label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-50">
                    <Clock className="w-4 h-4" />
                  </div>
                  <Input
                    type="date"
                    value={deadlineInputValue}
                    onChange={(e) => handleDeadlineChange(e.target.value)}
                    className="h-14 rounded-2xl border-2 bg-muted/30 font-black px-12 focus-visible:border-primary transition-all"
                  />
                  {detectedDate && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                      Auto-detected
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  onClick={handleSaveTask}
                  disabled={createTask.isPending}
                  className="flex-[2] h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-primary text-white shadow-2xl shadow-primary/30 transition-all hover:scale-105"
                >
                  {createTask.isPending ? 'Syncing...' : 'Index Objective'}
                </Button>
                <Button
                  onClick={handleStartRecording}
                  variant="outline"
                   className="flex-1 h-16 rounded-2xl font-black underline decoration-2 decoration-primary/30 hover:decoration-primary uppercase tracking-widest text-[11px] border-2 border-border/50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Re-scan
                </Button>
              </div>
            </motion.div>
          )}
        </div>
        
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-all duration-300 hover:rotate-90"
        >
          <X className="w-6 h-6" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
