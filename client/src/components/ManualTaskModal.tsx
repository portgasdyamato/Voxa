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
import { X, Calendar, Clock, Tag, AlertCircle, Quote, Layout, Layers, ShieldCheck, Zap } from 'lucide-react';
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
      toast({ title: "Task name required", description: "Please enter a name for your task.", variant: "destructive" });
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
        toast({ title: "Task updated successfully" });
      } else {
        await createTask(payload);
        toast({ title: "New task created" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Failed to save task", description: "Please check your connection and try again.", variant: "destructive" });
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
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[2.5rem] border-border bg-background shadow-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="p-10 pb-6 border-b border-border/50 relative bg-muted/20">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
               <Layers className="w-7 h-7 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {isEditing ? 'Edit Task' : 'Create New Task'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground font-medium mt-0.5">
                Set clear goals and keep track of your progress.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar flex-1 pb-16">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Task Name</Label>
              <Input
                value={taskTitle}
                onChange={(e) => handleTaskTitleChange(e.target.value)}
                placeholder="What needs to be done?"
                className="h-14 rounded-2xl border-border bg-muted/30 focus-visible:ring-primary/20 text-lg font-semibold px-6"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Description (Optional)</Label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Add any additional details or notes..."
                className="w-full min-h-[140px] rounded-[1.5rem] border border-border bg-muted/30 p-6 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-medium transition-all resize-none placeholder:text-muted-foreground/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Priority</Label>
                <Select value={manualPriority} onValueChange={setManualPriority}>
                  <SelectTrigger className="h-14 rounded-xl border-border bg-muted/30 text-sm font-semibold pl-6">
                    <SelectValue placeholder="Automatic Detection" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border p-2">
                    <SelectItem value="none" className="rounded-xl py-3 font-semibold text-xs">Based on keywords</SelectItem>
                    <SelectItem value="low" className="rounded-xl py-3 font-semibold text-xs text-emerald-600">Low Priority</SelectItem>
                    <SelectItem value="medium" className="rounded-xl py-3 font-semibold text-xs text-amber-600">Medium Priority</SelectItem>
                    <SelectItem value="high" className="rounded-xl py-3 font-semibold text-xs text-rose-600">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-14 rounded-xl border-border bg-muted/30 text-sm font-semibold pl-6">
                    <SelectValue placeholder="Uncategorized" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border p-2 max-h-[200px]">
                    <SelectItem value="none" className="rounded-xl py-3 font-semibold text-xs">General</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl py-3 font-semibold text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/40">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Due Date & Time</Label>
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground/30" />
                </div>
                <Input
                  type="datetime-local"
                  value={deadlineInputValue}
                  onChange={(e) => handleDeadlineChange(e.target.value)}
                  className="h-14 rounded-xl border-border bg-muted/30 text-sm font-semibold px-6"
                />
              </div>

              <AnimatePresence>
                {selectedDeadline && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-primary/5 border border-primary/10"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-primary" />
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">
                        Task due: <span className="text-foreground">{formatRelativeDate(selectedDeadline)}</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {selectedDeadline && (
              <div className="pt-6 border-t border-border/40">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-6 px-1">Reminder Notifications</p>
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

        <div className="p-10 border-t border-border bg-muted/20 flex gap-4 shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-14 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-500/10 hover:text-rose-600 transition-all border border-border/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveTask}
            disabled={isCreating || isUpdating}
            className="flex-[2] h-14 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          >
            {(isCreating || isUpdating) ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Task')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
