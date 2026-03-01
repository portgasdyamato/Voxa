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
import { X, Calendar, Clock, Tag, AlertCircle, Quote, Layout, Layers, ShieldCheck, Zap, ArrowRight, Command } from 'lucide-react';
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
      toast({ title: "Task name required", description: "Entry identification missing.", variant: "destructive" });
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
        toast({ title: "Protocol updated" });
      } else {
        await createTask(payload);
        toast({ title: "New node synchronized" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Sync failed", description: "Telemetry connection error.", variant: "destructive" });
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
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden rounded-[3rem] border border-white/[0.05] bg-[#050505] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
        <DialogHeader className="p-16 pb-8 border-b border-white/[0.03] relative bg-[#0a0a0a]">
          <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none">
            <Layers className="w-64 h-64 text-primary" />
          </div>
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl inner-glow">
               <Command className="w-8 h-8 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-4xl font-black tracking-[-0.05em] text-white">
                {isEditing ? 'Modify Entry' : 'New Deployment'}
              </DialogTitle>
              <DialogDescription className="text-sm font-bold uppercase tracking-[0.2em] text-white/20 mt-1">
                Synchronizing intentions with reality.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-16 pt-12 space-y-12 overflow-y-auto custom-scrollbar flex-1 pb-24">
          <div className="space-y-10">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 px-2 italic">Active Title</Label>
              <Input
                value={taskTitle}
                onChange={(e) => handleTaskTitleChange(e.target.value)}
                placeholder="What defines this node?"
                className="h-20 rounded-2xl border-white/[0.05] bg-white/[0.03] focus-visible:ring-primary/40 text-2xl font-black tracking-tight px-8 placeholder:text-white/5"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 px-2 italic">Contextual Depth</Label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Expand the core mission details..."
                className="w-full min-h-[160px] rounded-[2rem] border border-white/[0.05] bg-white/[0.03] p-8 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-base font-medium transition-all duration-500 resize-none placeholder:text-white/5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 px-2 italic">Focus Level</Label>
                <Select value={manualPriority} onValueChange={setManualPriority}>
                  <SelectTrigger className="h-16 rounded-2xl border-white/[0.05] bg-white/[0.03] text-sm font-bold px-8">
                    <SelectValue placeholder="Intelligence Core" />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl border-white/[0.05] bg-[#0a0a0a] p-4 shadow-3xl">
                    <SelectItem value="none" className="rounded-2xl py-4 font-bold text-[10px] uppercase tracking-widest">Auto Detection</SelectItem>
                    <SelectItem value="low" className="rounded-2xl py-4 font-bold text-[10px] uppercase tracking-widest text-emerald-500/80">Minor Focus</SelectItem>
                    <SelectItem value="medium" className="rounded-2xl py-4 font-bold text-[10px] uppercase tracking-widest text-amber-500/80">Standard Focus</SelectItem>
                    <SelectItem value="high" className="rounded-2xl py-4 font-bold text-[10px] uppercase tracking-widest text-rose-500/80">Critical Focus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 px-2 italic">Category Linkage</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-16 rounded-2xl border-white/[0.05] bg-white/[0.03] text-sm font-bold px-8">
                    <SelectValue placeholder="General Registry" />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl border-white/[0.05] bg-[#0a0a0a] p-4 max-h-[300px]">
                    <SelectItem value="none" className="rounded-2xl py-4 font-bold text-[10px] uppercase tracking-widest">Universal Sector</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-2xl py-4 font-bold text-[10px] uppercase tracking-widest">
                        <div className="flex items-center gap-4">
                          <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/[0.03]">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 italic">Chronological Target</Label>
                  <Clock className="w-4 h-4 text-white/10" />
                </div>
                <Input
                  type="datetime-local"
                  value={deadlineInputValue}
                  onChange={(e) => handleDeadlineChange(e.target.value)}
                  className="h-16 rounded-2xl border-white/[0.05] bg-white/[0.03] text-sm font-bold px-8"
                />
              </div>

              <AnimatePresence>
                {selectedDeadline && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-[1.5rem] bg-primary/5 border border-primary/20 flex items-center gap-6"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                       <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 italic">Temporal Resolution</p>
                      <p className="text-sm font-bold text-white mt-1">
                        Deployment finalized within: <span className="text-primary">{formatRelativeDate(selectedDeadline)}</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {selectedDeadline && (
              <div className="pt-10 border-t border-white/[0.03]">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 mb-8 px-2 italic">Aural Alert Protocols</p>
                <ReminderSettings
                  reminderEnabled={reminderEnabled}
                  reminderType={reminderType}
                  reminderTime={reminderTime}
                  onReminderEnabledChange={setReminderEnabled}
                  onReminderTypeChange={setReminderType}
                  onReminderTimeChange={setReminderTime}
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-16 border-t border-white/[0.03] bg-[#0a0a0a] flex gap-6 shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-20 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] italic hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-white/[0.05]"
          >
            Abort Sync
          </Button>
          <Button
            onClick={handleSaveTask}
            disabled={isCreating || isUpdating}
            className="flex-[2] h-20 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] italic bg-primary text-white shadow-2xl shadow-primary/30 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 flex items-center gap-4">
               {(isCreating || isUpdating) ? 'Synchronizing...' : (isEditing ? 'Commit Changes' : 'Execute Deployment')}
               <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
