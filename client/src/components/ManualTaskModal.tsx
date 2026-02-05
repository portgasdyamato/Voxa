import { useState, useEffect } from 'react';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { detectPriority } from '@/lib/priorityDetection';
import { detectDateFromText, formatRelativeDate } from '@/lib/dateDetection';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ReminderSettings } from '@/components/ReminderSettings';
import { Edit3, X, Tag, Calendar, Clock, Sparkles, AlertCircle, Check, Trash2, Layout, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ManualTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: any; // For editing
}

export function ManualTaskModal({ open, onOpenChange, task }: ManualTaskModalProps) {
  const isEditing = !!task;
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);
  const [deadlineInputValue, setDeadlineInputValue] = useState('');
  const [detectedDate, setDetectedDate] = useState<Date | null>(null);
  const [manualPriority, setManualPriority] = useState<string>('');
  
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderType, setReminderType] = useState<'manual' | 'morning' | 'default'>('default');
  const [reminderTime, setReminderTime] = useState<string>('09:00');
  
  const { toast } = useToast();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  useEffect(() => {
    if (task && open) {
      setTaskTitle(task.title || '');
      setTaskDescription(task.description || '');
      setSelectedCategory(task.categoryId?.toString() || 'none');
      setManualPriority(task.priority || '');
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        setSelectedDeadline(date);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        setDeadlineInputValue(`${year}-${month}-${day}T${hours}:${minutes}`);
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
    setSelectedCategory('');
    setSelectedDeadline(null);
    setDetectedDate(null);
    setDeadlineInputValue('');
    setManualPriority('');
    setReminderEnabled(true);
    setReminderType('default');
    setReminderTime('09:00');
  };

  const handleTaskTitleChange = (value: string) => {
    setTaskTitle(value);
    if (value.trim() && !isEditing) {
      const dateResult = detectDateFromText(value);
      if (dateResult.detectedDate && dateResult.confidence === 'high') {
        setDetectedDate(dateResult.detectedDate);
        if (!selectedDeadline) {
          const date = dateResult.detectedDate;
          setSelectedDeadline(date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          setDeadlineInputValue(`${year}-${month}-${day}T${hours}:${minutes}`);
        }
      } else {
        setDetectedDate(null);
      }
    } else {
      setDetectedDate(null);
    }
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      toast({ title: "Naming required", description: "Every objective needs a title.", variant: "destructive" });
      return;
    }

    const fullText = `${taskTitle} ${taskDescription}`.trim();
    const priority = manualPriority || detectPriority(fullText);
    
    const payload: any = {
      title: taskTitle.trim(),
      description: taskDescription.trim() || undefined,
      priority: (priority as 'high' | 'medium' | 'low') || 'medium',
      categoryId: selectedCategory && selectedCategory !== 'none' ? parseInt(selectedCategory) : undefined,
      dueDate: selectedDeadline ? selectedDeadline.toISOString() : null,
      reminderEnabled,
      reminderType,
      reminderTime: reminderType === 'manual' ? reminderTime : undefined,
    };

    try {
      if (isEditing) {
        await updateTask.mutateAsync({ id: task.id, updates: payload });
        toast({ title: "Objective Updated", description: "Your changes have been synchronized." });
      } else {
        await createTask.mutateAsync(payload);
        toast({ title: "Objective Created", description: `"${taskTitle}" is now indexed.` });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ title: "System Error", description: "Failed to persist changes.", variant: "destructive" });
    }
  };

  const handleDeadlineChange = (value: string) => {
    setDeadlineInputValue(value);
    if (value) {
      const date = new Date(value);
      setSelectedDeadline(date);
    } else {
      setSelectedDeadline(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[3rem] border-2 border-border/40 bg-card/95 backdrop-blur-3xl shadow-3xl">
        <DialogHeader className="p-10 pb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30 ring-4 ring-primary/10">
              {isEditing ? <Edit3 className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
            </div>
            <div>
              <DialogTitle className="text-4xl font-black tracking-tight mb-1">
                {isEditing ? 'Modify Target' : 'Initialize Target'}
              </DialogTitle>
              <DialogDescription className="text-base font-medium text-muted-foreground/80">
                Configure your objective metrics and deadline buffers.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-10 py-4 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Objective Title</Label>
            <Input
              value={taskTitle}
              onChange={(e) => handleTaskTitleChange(e.target.value)}
              placeholder="e.g. Q1 Operational Audit"
              className="h-16 rounded-2xl border-2 bg-muted/30 focus-visible:ring-0 focus-visible:border-primary font-black text-xl px-6 transition-all shadow-inner"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Description & Context</Label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Provide strategic details for this objective..."
              className="w-full min-h-[140px] rounded-2xl border-2 bg-muted/30 border-border p-6 focus:outline-none focus:border-primary font-bold text-base transition-all resize-none shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Priority Matrix
              </Label>
              <Select value={manualPriority} onValueChange={setManualPriority}>
                <SelectTrigger className="h-14 rounded-2xl border-2 bg-muted/30 font-black text-sm px-6">
                  <SelectValue placeholder="System Inference" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 shadow-2xl p-1 bg-popover/95">
                  <SelectItem value="none" className="rounded-xl font-bold py-3">Neural Detect</SelectItem>
                  <SelectItem value="low" className="rounded-xl font-bold text-emerald-500 py-3">Low Flow</SelectItem>
                  <SelectItem value="medium" className="rounded-xl font-bold text-amber-500 py-3">Balanced</SelectItem>
                  <SelectItem value="high" className="rounded-xl font-bold text-rose-500 py-3">Critical Path</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> Classification
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-14 rounded-2xl border-2 bg-muted/30 font-black text-sm px-6">
                  <SelectValue placeholder="General Logic" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 shadow-2xl p-1 bg-popover/95 max-h-[300px]">
                  <SelectItem value="none" className="rounded-xl font-bold py-3">Uncategorized</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl font-bold py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full border-2 border-white/20" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Execution Window
            </Label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-50 group-hover:opacity-100 transition-opacity">
                <Clock className="w-5 h-5" />
              </div>
              <Input
                type="datetime-local"
                value={deadlineInputValue}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                className="h-14 rounded-2xl border-2 bg-muted/30 font-black px-14 transition-all focus:bg-background"
              />
            </div>
            <AnimatePresence>
              {(detectedDate || selectedDeadline) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary/5 border border-primary/20 text-sm font-black text-primary shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Target locked: {formatRelativeDate((detectedDate || selectedDeadline) as Date)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {selectedDeadline && (
            <div className="pt-6 border-t-2 border-dashed border-border/50">
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

        <div className="p-10 bg-muted/10 border-t-2 border-border/40 flex gap-6">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-muted/50"
          >
            Abort Sync
          </Button>
          <Button
            onClick={handleSaveTask}
            disabled={createTask.isPending || updateTask.isPending}
            className="flex-[2] h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-foreground text-background hover:bg-foreground/90 shadow-2xl transition-all active:scale-95"
          >
            {(createTask.isPending || updateTask.isPending) ? 'Processing...' : (isEditing ? 'Confirm Update' : 'Initialize Command')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
