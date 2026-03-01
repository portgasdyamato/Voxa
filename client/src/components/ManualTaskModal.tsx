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
import { Calendar, Clock, Plus, Edit3, ArrowRight, CheckCircle } from 'lucide-react';
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
        toast({ title: 'Task updated successfully' });
      } else {
        await createTask(payload);
        toast({ title: 'Task added!' });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'destructive' });
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
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0c10] shadow-[0_40px_80px_rgba(0,0,0,0.8)] flex flex-col">
        
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              isEditing ? 'bg-amber-500/15 border border-amber-500/25' : 'bg-primary/15 border border-primary/25'
            )}>
              {isEditing ? <Edit3 className="w-5 h-5 text-amber-400" /> : <Plus className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-white tracking-tight">
                {isEditing ? 'Edit Task' : 'New Task'}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-white/30 font-medium mt-0.5">
                {isEditing ? 'Update task details below' : 'Add the details for your new task'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Task name */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Task name *</Label>
            <Input
              value={taskTitle}
              onChange={(e) => handleTaskTitleChange(e.target.value)}
              placeholder="What do you need to do?"
              className="h-12 rounded-xl border-white/[0.08] bg-white/[0.04] focus-visible:ring-primary/40 text-base font-semibold px-4 placeholder:text-white/15"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Notes <span className="normal-case tracking-normal text-white/20">(optional)</span></Label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-sm font-medium transition-all resize-none placeholder:text-white/15 text-white"
            />
          </div>

          {/* Priority + Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Priority</Label>
              <Select value={manualPriority} onValueChange={setManualPriority}>
                <SelectTrigger className="h-11 rounded-xl border-white/[0.08] bg-white/[0.04] text-sm font-semibold px-4">
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/[0.08] bg-[#0d1117] p-1.5">
                  <SelectItem value="none" className="rounded-lg py-2.5 text-sm font-medium">Auto-detect</SelectItem>
                  <SelectItem value="low" className="rounded-lg py-2.5 text-sm font-medium text-emerald-400">Low</SelectItem>
                  <SelectItem value="medium" className="rounded-lg py-2.5 text-sm font-medium text-amber-400">Medium</SelectItem>
                  <SelectItem value="high" className="rounded-lg py-2.5 text-sm font-medium text-rose-400">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-11 rounded-xl border-white/[0.08] bg-white/[0.04] text-sm font-semibold px-4">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/[0.08] bg-[#0d1117] p-1.5 max-h-[220px]">
                  <SelectItem value="none" className="rounded-lg py-2.5 text-sm font-medium">No category</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-lg py-2.5 text-sm font-medium">
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

          {/* Due date */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Due date <span className="normal-case tracking-normal text-white/20">(optional)</span>
            </Label>
            <Input
              type="datetime-local"
              value={deadlineInputValue}
              onChange={(e) => handleDeadlineChange(e.target.value)}
              className="h-11 rounded-xl border-white/[0.08] bg-white/[0.04] text-sm font-semibold px-4"
            />
            <AnimatePresence>
              {selectedDeadline && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20"
                >
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs font-semibold text-white/60">Due {formatRelativeDate(selectedDeadline)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reminders — only show if deadline set */}
          {selectedDeadline && (
            <div className="space-y-3 pt-2 border-t border-white/[0.06]">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Reminder</Label>
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02] flex gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11 rounded-xl font-bold text-sm text-white/40 hover:text-white hover:bg-white/[0.06] transition-all border border-white/[0.06]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveTask}
            disabled={isPending || !taskTitle.trim()}
            className="flex-[2] h-11 rounded-xl font-black text-sm bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {isEditing ? 'Save Changes' : 'Add Task'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
