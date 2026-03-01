import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useCreateTask, useTasks, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { detectPriority } from '@/lib/priorityDetection';
import { detectCategory, parseCategoryFromText } from '@/lib/categoryDetection';
import { detectDateTimeFromText, formatRelativeDate, parseTaskFromSpeech } from '@/lib/dateDetection';
import { parseVoiceCommand, findTaskByIdentifier } from '@/lib/voiceCommands';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mic, Zap, Clock, Activity, RefreshCw, Sparkles, Target, Database, Cpu, Radio, Hash } from 'lucide-react';
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
  const [commandType, setCommandType] = useState<string>('add');
  const [commandDescription, setCommandDescription] = useState<string>('');
  
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderType, setReminderType] = useState<'manual' | 'morning' | 'default'>('default');
  const [reminderTime, setReminderTime] = useState<string>('');
  
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const { data: tasks } = useTasks();
  
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
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

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
      
      const command = parseVoiceCommand(transcript);
      setCommandType(command.type);
      
      const descriptions: Record<string, string> = {
        add: 'Creating mission...',
        delete: 'Removing task...',
        complete: 'Finalizing task...',
        uncomplete: 'Restoring task...',
        update: 'Refining details...',
        list: 'Scanning tasks...',
        clear_completed: 'Purging history...',
        unknown: 'Analyzing command...',
      };
      setCommandDescription(descriptions[command.type] || 'Processing');
      
      let finalCategoryId = '';
      let finalDeadline: Date | null = null;
      let finalTaskName = '';

      if (command.type === 'add') {
        let textToParse = transcript;
        
        if (categories) {
          const { categoryId, cleanedText } = parseCategoryFromText(transcript, categories);
          if (categoryId) {
            finalCategoryId = categoryId.toString();
            setSelectedCategory(finalCategoryId);
            textToParse = cleanedText;
          }
        }

        const { taskName, deadline, priority } = parseTaskFromSpeech(textToParse);
        finalTaskName = taskName;
        setParsedTaskName(taskName);
        setDetectedPriority(priority);

        const dateTimeResult = detectDateTimeFromText(textToParse);
        if (dateTimeResult.detectedDate && (dateTimeResult.confidence === 'high' || dateTimeResult.confidence === 'medium')) {
          finalDeadline = dateTimeResult.detectedDate;
          setDetectedDate(finalDeadline);
          setSelectedDeadline(finalDeadline);
          
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
      } else if (command.type === 'delete' || command.type === 'complete' || command.type === 'uncomplete' || command.type === 'update') {
        finalTaskName = command.taskIdentifier || '';
        setParsedTaskName(finalTaskName);
      }
      
      const executionCategory = finalCategoryId || selectedCategory;
      const executionDeadline = finalDeadline !== null ? finalDeadline : selectedDeadline;
      const executionTaskName = finalTaskName || parsedTaskName;

      setTimeout(() => {
        handleExecuteCommand(executionCategory, executionDeadline, executionTaskName);
      }, 500);
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

  const handleExecuteCommand = async (
    overrideCategory?: string,
    overrideDeadline?: Date | null,
    overrideTaskName?: string
  ) => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-[3.5rem] border-2 border-white/5 bg-slate-950/80 backdrop-blur-[50px] shadow-[0_0_100px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col noise-surface">
        <DialogHeader className="p-12 pb-8 relative overflow-hidden bg-white/[0.02] flex-shrink-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          <div className="flex items-center gap-8 relative z-10">
            <motion.div 
              animate={{ rotate: isListening ? 360 : 0 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-[0_0_40px_rgba(var(--primary),0.3)] ring-4 ring-white/5"
            >
              <Mic className="w-10 h-10" />
            </motion.div>
            <div>
              <DialogTitle className="text-4xl font-black tracking-tighter uppercase italic text-gradient">VOICE PROTOCOL</DialogTitle>
              <DialogDescription className="text-[10px] font-black tracking-[0.4em] text-primary/40 mt-1 uppercase italic">
                Aural Intelligence System v.2.0
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-12 py-10 space-y-12 overflow-y-auto flex-1 custom-scrollbar">
          {!showTranscription ? (
            <div className="flex flex-col items-center py-12 gap-16 relative">
              {/* Scientific Waveform UI */}
              <div className="relative flex items-center justify-center w-full h-40">
                <AnimatePresence>
                  {isListening && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1">
                      {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ 
                            height: [20, Math.random() * 80 + 20, 20],
                            opacity: [0.3, 0.8, 0.3],
                          }}
                          transition={{ 
                            duration: 0.3 + Math.random() * 0.4, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }}
                          className="w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" 
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
                <motion.div 
                  className={cn(
                    "w-32 h-32 rounded-[3.5rem] flex items-center justify-center border-4 transition-all duration-700 relative z-20",
                    isListening ? "border-rose-500 bg-rose-500/10 shadow-[0_0_60px_rgba(244,63,94,0.3)]" : "border-white/10 bg-white/5 shadow-2xl"
                  )}
                  animate={{ 
                    scale: isListening ? [1, 1.1, 1] : 1,
                    rotate: isListening ? [0, 5, -5, 0] : 0
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Mic className={cn("w-12 h-12 transition-all duration-700", isListening ? "text-rose-500" : "text-white/40")} />
                  {isListening && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -bottom-16 flex flex-col items-center gap-2"
                    >
                      <span className="text-rose-500 font-black tracking-[0.3em] text-[10px] animate-pulse">STREAMING...</span>
                      <span className="text-white/40 font-black tracking-widest text-[9px]">{formatTime(recordingTime)}</span>
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Orbiting Elements */}
                {isListening && [1,2,3].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4 + i * 2, repeat: Infinity, ease: "linear" }}
                    className="absolute w-64 h-64 border border-white/[0.03] rounded-full pointer-events-none"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/40 blur-[2px]" />
                  </motion.div>
                ))}
              </div>
              
              <div className="text-center space-y-4 max-w-sm">
                <h4 className="text-2xl font-black tracking-tighter italic uppercase">
                  {isListening ? 'Scanning Frequency' : 'Idle Protocol'}
                </h4>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 leading-relaxed italic">
                  {isListening ? 'Speak clearly into the primary input receptor for optimal data capture' : 'Activate the neural link to begin audio data ingestion'}
                </p>
              </div>

              <Button
                onClick={isListening ? stopListening : handleStartRecording}
                className={cn(
                  "h-20 w-full rounded-3xl font-black uppercase tracking-[0.3em] text-xs transition-all duration-500 border-2 italic",
                  isListening ? "bg-rose-500 border-rose-600 text-white shadow-xl shadow-rose-900/20" : "bg-white text-black hover:scale-105 active:scale-95"
                )}
              >
                {isListening ? 'Cease Scanning' : 'Initialize Scan'}
              </Button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-10"
            >
              {/* Scanned Data Stream Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-1 md:col-span-2 glass rounded-[2.5rem] p-10 border-white/5 space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-all duration-700">
                    <Radio className="w-16 h-16 text-primary" />
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                       <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40 flex items-center gap-3 italic">
                         <Activity className="w-3 h-3" /> Audio Registry
                       </h4>
                       <p className="text-sm text-neutral-400 font-bold italic">"{transcript}"</p>
                    </div>

                    <div className="flex gap-12">
                      <div className="space-y-2">
                         <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500/40 flex items-center gap-3 italic">
                           <Cpu className="w-3 h-3" /> Core Intent
                         </h4>
                         <p className="text-xl font-black tracking-tighter text-blue-500 uppercase italic">{commandDescription}</p>
                      </div>
                      <div className="space-y-2">
                         <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500/40 flex items-center gap-3 italic">
                           <Database className="w-3 h-3" /> Identified Subject
                         </h4>
                         <p className="text-xl font-black tracking-tighter text-emerald-500 uppercase italic truncate max-w-[200px]">{parsedTaskName || 'UNIDENTIFIED'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-2 italic">Sector Assignment</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-16 rounded-2xl border-white/5 bg-white/5 font-black uppercase tracking-[0.2em] text-[10px] px-8 italic hover:bg-white/10 transition-colors">
                      <SelectValue placeholder="Neutral Zone" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[2rem] border-white/5 glass p-2">
                      <SelectItem value="none" className="rounded-xl font-black uppercase tracking-[0.2em] text-[9px] py-4 italic">Unassigned</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl font-black uppercase tracking-[0.2em] text-[9px] py-4 italic">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-2 italic">Priority Protocol</Label>
                  <div className={cn(
                    "h-16 rounded-2xl border-2 flex items-center px-8 gap-4 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-inner",
                    detectedPriority === 'high' ? "bg-rose-500/10 border-rose-500/30 text-rose-500" :
                    detectedPriority === 'medium' ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
                    "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  )}>
                    <Target className="w-4 h-4" />
                    {detectedPriority.toUpperCase()} LEVEL
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-4">
                  <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-2 italic flex items-center gap-3">
                    <Clock className="w-3 h-3" /> Temporal Target
                  </Label>
                  <div className="relative group">
                    <Input
                      type="datetime-local"
                      value={deadlineInputValue}
                      onChange={(e) => handleDeadlineChange(e.target.value)}
                      className="h-16 rounded-2xl border-2 border-white/5 bg-white/5 font-black uppercase tracking-[0.2em] text-[11px] px-8 italic focus:border-primary/40 transition-all text-neutral-300"
                    />
                    <Hash className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary/40 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 pt-10 border-t border-white/5">
                <div className="flex items-center justify-between px-10 py-6 rounded-3xl bg-primary/5 border border-primary/20 relative overflow-hidden group">
                  <motion.div 
                    animate={{ x: [-100, 400] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-primary/10 to-transparent skew-x-12"
                  />
                  <div className="flex items-center gap-4 relative z-10">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
                       Finalizing Operations...
                    </span>
                  </div>
                  <div className="flex items-center gap-2 relative z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    <span className="text-[9px] font-black text-primary/60 italic uppercase tracking-widest">Execute in 2.0s</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleStartRecording}
                  variant="ghost"
                  className="h-16 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] italic text-muted-foreground/40 hover:text-white hover:bg-white/5 transition-all"
                >
                  <RefreshCw className="w-4 h-4 mr-3" /> Recalibrate Signal
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
