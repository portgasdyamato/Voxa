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
import { Calendar, Clock, Plus, Edit3, ArrowRight, CheckCircle, Boxes, Zap, AlertCircle } from 'lucide-react';
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
      toast({ title: 'Task name is required', variant: 'destructive' });
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
        toast({ title: 'Task updated' });
      } else {
        await createTask(payload);
        toast({ title: 'Task created' });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Process failed', description: 'Could not synchronize changes.', variant: 'destructive' });
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

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border border-white/[0.22] bg-[#080809] backdrop-blur-[60px] shadow-[0_60px_120px_rgba(0,0,0,0.98)] flex flex-col max-h-[90vh] rounded-[2.5rem]">
        {/* Bevel Top Highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />
        {/* Subtle glass overlay */}
        <div className="absolute inset-0 bg-white/[0.03] pointer-events-none" />
        
        {/* Header */}
        <DialogHeader className="px-8 pt-10 pb-8 border-b border-white/[0.06] flex-shrink-0 relative z-10">
          <div className="flex items-center gap-5">
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-inner',
              isEditing ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/[0.06] border-white/10'
            )}>
              {isEditing ? <Edit3 className="w-6 h-6 text-blue-400" /> : <Boxes className="w-6 h-6 text-white/40" />}
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-semibold text-white tracking-tight leading-none">
                {isEditing ? 'Update Task' : 'New Task'}
              </DialogTitle>
              <DialogDescription className="text-sm text-white/30 font-light">
                {isEditing ? 'Edit the details below to update.' : 'Fill in the details to create a new task.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={(e) => { e.preventDefault(); handleSaveTask(); }} className="flex flex-col flex-1 overflow-hidden relative z-10">
          <div className="px-8 py-8 space-y-7 overflow-y-auto flex-1 no-scrollbar">

            {/* Task Title */}
            <div className="space-y-2.5">
              <Label className="text-xs font-medium text-white/40 pl-1">Task Title</Label>
              <Input
                value={taskTitle}
                onChange={(e) => handleTaskTitleChange(e.target.value)}
                placeholder="What needs to be done?"
                className="h-13 py-3.5 rounded-2xl border-white/[0.1] bg-white/[0.04] focus-visible:ring-white/10 focus-visible:border-white/20 text-base font-medium px-5 placeholder:text-white/20 transition-all"
                autoFocus
              />
            </div>

            {/* Priority + Category Grid */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label className="text-xs font-medium text-white/40 pl-1">Priority</Label>
                <Select value={manualPriority} onValueChange={setManualPriority}>
                  <SelectTrigger className="h-11 rounded-2xl border-white/[0.1] bg-white/[0.04] text-sm font-medium px-4 text-white/70">
                    <SelectValue placeholder="Auto detect" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/10 bg-[#0c0c0e]/98 backdrop-blur-xl p-1.5 shadow-2xl">
                    <SelectItem value="none" className="rounded-xl py-2.5 px-3 text-sm font-medium">Auto Detect</SelectItem>
                    <SelectItem value="high" className="rounded-xl py-2.5 px-3 text-sm font-medium text-rose-400">High</SelectItem>
                    <SelectItem value="medium" className="rounded-xl py-2.5 px-3 text-sm font-medium text-blue-400">Medium</SelectItem>
                    <SelectItem value="low" className="rounded-xl py-2.5 px-3 text-sm font-medium text-white/40">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-medium text-white/40 pl-1">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-11 rounded-2xl border-white/[0.1] bg-white/[0.04] text-sm font-medium px-4 text-white/70">
                    <SelectValue placeholder="General" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/10 bg-[#0c0c0e]/98 backdrop-blur-xl p-1.5 shadow-2xl max-h-[240px]">
                    <SelectItem value="none" className="rounded-xl py-2.5 px-3 text-sm font-medium">General</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl py-2.5 px-3 text-sm font-medium text-white/70">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2.5">
              <Label className="text-xs font-medium text-white/40 pl-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 opacity-50" /> Due Date
              </Label>
              <Input
                type="datetime-local"
                value={deadlineInputValue}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                className="h-11 rounded-2xl border-white/[0.1] bg-white/[0.04] text-sm font-medium px-5 text-white/60 transition-all"
              />
              <AnimatePresence>
                {selectedDeadline && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-blue-500/[0.08] border border-blue-500/[0.15]"
                  >
                    <CheckCircle className="w-4 h-4 text-blue-400/80 flex-shrink-0" />
                    <span className="text-sm font-medium text-blue-400/80">Due {formatRelativeDate(selectedDeadline)}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reminder Logic */}
            {selectedDeadline && (
              <div className="space-y-5 pt-6 border-t border-white/[0.06]">
                <div className="flex items-center gap-2.5 px-1">
                  <Zap className="w-3.5 h-3.5 text-white/20" />
                  <span className="text-xs font-medium text-white/30">Notifications</span>
                </div>
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

          {/* Footer Actions — Bevel Frost Style */}
          <div className="px-8 py-6 border-t border-white/[0.06] flex gap-4 flex-shrink-0 items-center justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 rounded-full text-sm font-medium text-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>

            {/* Primary CTA — matches landing page button style */}
            <button
              type="submit"
              disabled={isPending || !taskTitle.trim()}
              className="group relative h-11 px-8 rounded-full border border-white/20 bg-gradient-to-br from-white/[0.1] to-white/[0.04] backdrop-blur-[40px] text-white text-sm font-medium tracking-tight transition-all hover:scale-[1.03] active:scale-[0.98] hover:border-white/30 shadow-xl overflow-hidden disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2.5"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              {isPending ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>{isEditing ? 'Update Task' : 'Create Task'}</span>
                  <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
