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
import { Edit3, X, Tag, Calendar, Clock, Sparkles, AlertCircle, Check, Trash2 } from 'lucide-react';
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
  const [reminderTime, setReminderTime] = useState<string>('');
  
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
        setDeadlineInputValue(date.toISOString().split('T')[0]);
      }
      setReminderEnabled(task.reminderEnabled ?? true);
      setReminderType(task.reminderType || 'default');
      setReminderTime(task.reminderTime || '');
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
    setReminderTime('');
  };

  const handleTaskTitleChange = (value: string) => {
    setTaskTitle(value);
    if (value.trim() && !isEditing) {
      const dateResult = detectDateFromText(value);
      if (dateResult.detectedDate && dateResult.confidence === 'high') {
        setDetectedDate(dateResult.detectedDate);
        if (!selectedDeadline) {
          setSelectedDeadline(dateResult.detectedDate);
          setDeadlineInputValue(dateResult.detectedDate.toISOString().split('T')[0]);
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
      date.setHours(23, 59, 59, 999);
      setSelectedDeadline(date);
    } else {
      setSelectedDeadline(null);
    }
  };

  const getDetectedPriority = () => {
    if (manualPriority) return manualPriority;
    const fullText = `${taskTitle} ${taskDescription}`.trim();
    return fullText ? detectPriority(fullText) : 'medium';
  };

  const priorityColors: any = {
    high: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    low: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-[2.5rem] border-2 border-border/50 bg-card/95 backdrop-blur-3xl shadow-2xl">
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/10">
              <PlusIcon className="w-7 h-7" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black tracking-tight">
                {isEditing ? 'Modify Objective' : 'New Objective'}
              </DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">
                Define your target and set the parameters.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-4 space-y-8 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Primary Title</Label>
              <Input
                value={taskTitle}
                onChange={(e) => handleTaskTitleChange(e.target.value)}
                placeholder="What needs to be achieved?"
                className="h-14 rounded-2xl border-2 bg-muted/30 focus-visible:ring-0 focus-visible:border-primary font-bold text-lg px-6"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Context & Details</Label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Add sub-objectives or context..."
                className="w-full min-h-[120px] rounded-2xl border-2 bg-muted/30 border-border p-4 focus:outline-none focus:border-primary font-medium text-sm transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Priority
                </Label>
                <Select value={manualPriority} onValueChange={setManualPriority}>
                  <SelectTrigger className="h-12 rounded-xl border-2 bg-muted/30 font-bold">
                    <SelectValue placeholder="Neural Detection" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 shadow-xl p-1">
                    <SelectItem value="none" className="rounded-xl font-bold">Smart Detect</SelectItem>
                    <SelectItem value="low" className="rounded-xl font-bold text-emerald-500">Low Urgency</SelectItem>
                    <SelectItem value="medium" className="rounded-xl font-bold text-amber-500">Medium Flow</SelectItem>
                    <SelectItem value="high" className="rounded-xl font-bold text-rose-500">Critical Path</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
                  <Tag className="w-3 h-3" /> Classification
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 rounded-xl border-2 bg-muted/30 font-bold">
                    <SelectValue placeholder="System Default" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 shadow-xl p-1">
                    <SelectItem value="none" className="rounded-xl font-bold">Unclassified</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl font-bold">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Execution Deadline
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={deadlineInputValue}
                  onChange={(e) => handleDeadlineChange(e.target.value)}
                  className="h-12 rounded-xl border-2 bg-muted/30 font-bold px-4"
                />
              </div>
              <AnimatePresence>
                {(detectedDate || selectedDeadline) && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 text-xs font-bold text-primary"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Indexed for: {formatRelativeDate((detectedDate || selectedDeadline) as Date)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {selectedDeadline && (
              <div className="pt-4 border-t-2 border-dashed border-border/50">
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

        <div className="p-8 border-t-2 border-border/40 bg-muted/20 flex gap-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            Abort
          </Button>
          <Button
            onClick={handleSaveTask}
            disabled={createTask.isPending || updateTask.isPending}
            className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {(createTask.isPending || updateTask.isPending) ? 'Syncing...' : (isEditing ? 'Confirm Update' : 'Initialize Objective')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlusIcon(props: any) {
  return (
    <svg 
      {...props}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
