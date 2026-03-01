import { useState, useEffect } from 'react';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { detectPriority } from '@/lib/priorityDetection';
import { detectCategory, parseCategoryFromText } from '@/lib/categoryDetection';
import { detectDateFromText, formatRelativeDate, formatDateTimeForInput } from '@/lib/dateDetection';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ReminderSettings } from '@/components/ReminderSettings';
import { X, Calendar, Clock, Sparkles, Tag, AlertCircle, Quote, Layout, Layers, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ManualTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: any;
}

export function ManualTaskModal({ open, onOpenChange, task }: ManualTaskModalProps) {
  const isEditing = !!task;
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('none');
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);
  const [deadlineInputValue, setDeadlineInputValue] = useState('');
  const [manualPriority, setManualPriority] = useState<string>('none');
  
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderType, setReminderType] = useState<'manual' | 'morning' | 'default'>('default');
  const [reminderTime, setReminderTime] = useState<string>('09:00');
  
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const { mutateAsync: createTask, isPending: isCreating } = useCreateTask();
  const { mutateAsync: updateTask, isPending: isUpdating } = useUpdateTask();

  useEffect(() => {
    if (task && open) {
      setTaskTitle(task.title || '');
      setTaskDescription(task.description || '');
      setSelectedCategory(task.categoryId?.toString() || 'none');
      setManualPriority(task.priority || 'none');
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        setSelectedDeadline(date);
        setDeadlineInputValue(formatDateTimeForInput(date));
      } else {
        setSelectedDeadline(null);
        setDeadlineInputValue('');
      }
      setReminderEnabled(task.reminderEnabled ?? true);
      setReminderType(task.reminderType || 'default');
      setReminderTime(task.reminderTime || '09:00');
    } else if (!open) {
      resetForm();
    }
  }, [task, open]);

  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setSelectedCategory('none');
    setSelectedDeadline(null);
    setDeadlineInputValue('');
    setManualPriority('none');
    setReminderEnabled(true);
    setReminderType('default');
    setReminderTime('09:00');
  };

  const handleTaskTitleChange = (value: string) => {
    let currentTitle = value;
    if (value.trim()) {
      if ((selectedCategory === 'none' || !selectedCategory) && categories) {
        const { categoryId, cleanedText } = parseCategoryFromText(value, categories);
        if (categoryId) {
          setSelectedCategory(categoryId.toString());
          currentTitle = cleanedText;
        }
      }
      if (!isEditing && !selectedDeadline) {
        const dateResult = detectDateFromText(currentTitle);
        if (dateResult.detectedDate && dateResult.confidence === 'high') {
          const date = dateResult.detectedDate;
          setSelectedDeadline(date);
          setDeadlineInputValue(formatDateTimeForInput(date));
          currentTitle = dateResult.cleanedText;
        }
      }
    }
    setTaskTitle(currentTitle);
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      toast({ title: "Identification Required", description: "All mission nodes must be identified.", variant: "destructive" });
      return;
    }
    const fullText = `${taskTitle} ${taskDescription}`.trim();
    const priority = (manualPriority && manualPriority !== 'none') ? manualPriority : detectPriority(fullText);
    const payload: any = {
      title: taskTitle.trim(),
      description: taskDescription.trim() || null,
      priority: (priority as 'high' | 'medium' | 'low') || 'medium',
      categoryId: selectedCategory && selectedCategory !== 'none' ? parseInt(selectedCategory) : null,
      dueDate: selectedDeadline ? selectedDeadline.toISOString() : null,
      reminderEnabled,
      reminderType,
      reminderTime: reminderType === 'manual' ? reminderTime : null,
    };
    try {
      if (isEditing) {
        await updateTask({ id: task.id, updates: payload });
        toast({ title: "Node Synchronized" });
      } else {
        await createTask(payload);
        toast({ title: "Protocol Initiated" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Synchronization Failure", description: "Database uplink failed.", variant: "destructive" });
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden noise-surface border-2 border-white/5 bg-slate-950/80 backdrop-blur-[40px] shadow-[0_0_100px_rgba(0,0,0,0.4)] rounded-[4rem] flex flex-col max-h-[92vh]">
        <DialogHeader className="p-12 pb-8 border-b border-white/5 relative bg-white/[0.02] flex-shrink-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-20 h-20 rounded-[2.5rem] bg-foreground/5 flex items-center justify-center border-2 border-white/10 shadow-2xl group transition-all">
               <Layers className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <DialogTitle className="text-4xl font-black tracking-tighter text-gradient italic uppercase">
                {isEditing ? 'RECONFIGURING' : 'DEPLOYING'} NODE
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mt-1 italic">
                Strategic Intelligence Unit v.4.2
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-12 space-y-12 overflow-y-auto custom-scrollbar flex-1">
          {/* Main Content Sections */}
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <Quote className="w-3.5 h-3.5 text-primary opacity-40" />
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Mission Descriptor</Label>
              </div>
              <Input
                value={taskTitle}
                onChange={(e) => handleTaskTitleChange(e.target.value)}
                placeholder="DEFINE OBJECTIVE..."
                className="h-20 rounded-[1.5rem] border-white/5 bg-white/5 focus-visible:ring-primary/40 focus-visible:border-primary/20 text-2xl font-black tracking-tight italic placeholder:not-italic placeholder:text-muted-foreground/10 px-10 transition-all shadow-inner"
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <Layout className="w-3.5 h-3.5 text-primary opacity-40" />
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Operational Context</Label>
              </div>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="APPEND SUB-ROUTINES..."
                className="w-full min-h-[160px] rounded-[2rem] border-2 border-white/5 bg-white/5 p-8 focus:outline-none focus:border-primary/20 text-base font-medium transition-all resize-none placeholder:opacity-20 shadow-inner group-hover:bg-white/[0.07] text-neutral-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500 opacity-40" />
                  <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Threat Level</Label>
                </div>
                <Select value={manualPriority} onValueChange={setManualPriority}>
                  <SelectTrigger className="h-16 rounded-2xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] pl-8 italic transition-all hover:bg-white/10">
                    <SelectValue placeholder="AUTO_ANALYZE" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[2.5rem] glass border-white/5 p-2">
                    <SelectItem value="none" className="rounded-xl font-black uppercase tracking-[0.2em] text-[10px] py-4 italic">Analysis Mode</SelectItem>
                    <SelectItem value="low" className="rounded-xl font-black uppercase tracking-[0.2em] text-[10px] py-4 italic text-emerald-500">Low Protocol</SelectItem>
                    <SelectItem value="medium" className="rounded-xl font-black uppercase tracking-[0.2em] text-[10px] py-4 italic text-amber-500">Mid Protocol</SelectItem>
                    <SelectItem value="high" className="rounded-xl font-black uppercase tracking-[0.2em] text-[10px] py-4 italic text-rose-500">High Protocol</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <Tag className="w-3.5 h-3.5 text-primary opacity-40" />
                  <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Mission Sector</Label>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-16 rounded-2xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] pl-8 italic transition-all hover:bg-white/10">
                    <SelectValue placeholder="NEUTRAL_ZONE" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[2.5rem] glass border-white/5 p-2 max-h-[280px]">
                    <SelectItem value="none" className="rounded-xl font-black uppercase tracking-[0.2em] text-[10px] py-4 italic">Unassigned</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl font-black uppercase tracking-[0.2em] text-[10px] py-4 italic">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: cat.color, color: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <Calendar className="w-3.5 h-3.5 text-primary opacity-40" />
                   <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Temporal Target</Label>
                </div>
                <div className="relative group overflow-hidden rounded-2xl">
                  <Input
                    type="datetime-local"
                    value={deadlineInputValue}
                    onChange={(e) => handleDeadlineChange(e.target.value)}
                    className="h-16 rounded-2xl border-2 border-white/5 bg-white/5 text-[11px] font-black uppercase tracking-[0.2em] px-8 italic focus:border-primary/40 focus:bg-white/[0.08] transition-all"
                  />
                </div>
              </div>
              
              <AnimatePresence>
                {selectedDeadline && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex items-center justify-between px-8 py-5 rounded-[1.5rem] bg-primary/5 text-[10px] font-black uppercase tracking-[0.3em] text-primary border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.05)]"
                  >
                    <div className="flex items-center gap-4">
                      <Zap className="w-4 h-4 animate-pulse" />
                      <span>Temporal Sync: <span className="text-white/80">{formatRelativeDate(selectedDeadline)}</span></span>
                    </div>
                    <div className="flex gap-1.5">
                       {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-primary/20 rounded-full" />)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {selectedDeadline && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-10 border-t border-white/5"
              >
                <ReminderSettings
                  reminderEnabled={reminderEnabled}
                  reminderType={reminderType}
                  reminderTime={reminderTime}
                  onReminderEnabledChange={setReminderEnabled}
                  onReminderTypeChange={setReminderType}
                  onReminderTimeChange={setReminderTime}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Global Control Bar */}
        <div className="p-12 bg-white/[0.03] border-t border-white/5 flex gap-8 items-center flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-20 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-[10px] border border-white/5 hover:bg-white/5 transition-all italic hover:text-rose-500"
          >
            Abort Operation
          </Button>
          <Button
            onClick={handleSaveTask}
            disabled={isCreating || isUpdating}
            className="flex-[2] h-20 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-[10px] gradient-primary shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all italic"
          >
            {(isCreating || isUpdating) ? 'SYNCING DATA...' : `CONFIRM ${isEditing ? 'RECONFIG' : 'DEPLOYMENT'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

