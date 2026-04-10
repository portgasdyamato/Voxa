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
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border border-white/[0.22] bg-[#010101] backdrop-blur-[40px] shadow-[0_45px_100px_rgba(0,0,0,0.95)] flex flex-col max-h-[90vh] translate-y-[-50%] rounded-[2.5rem]">
         <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />
         <div className="absolute inset-0 bg-white/[0.04] pointer-events-none" />
        
        {/* Header */}
        <DialogHeader className="px-10 pt-12 pb-10 border-b border-white/[0.05] flex-shrink-0 relative z-10">
          <div className="flex items-center gap-6">
            <div className={cn(
              'w-16 h-16 rounded-[1.75rem] flex items-center justify-center flex-shrink-0 border',
              isEditing ? 'bg-blue-500/10 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-white/[0.05] border-white/10'
            )}>
              {isEditing ? <Edit3 className="w-8 h-8 text-blue-400" /> : <Boxes className="w-8 h-8 text-white/40" />}
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-[2rem] font-bold text-white tracking-tight leading-none">
                {isEditing ? 'Update Task' : 'New Task'}
              </DialogTitle>
              <DialogDescription className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em]">
                {isEditing ? 'Refining operational parameters' : 'Establishing new productivity node'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={(e) => { e.preventDefault(); handleSaveTask(); }} className="flex flex-col flex-1 overflow-hidden relative z-10">
          <div className="px-10 py-10 space-y-10 overflow-y-auto flex-1 no-scrollbar">
          
          {/* Task title */}
          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 pl-1">Task Title</Label>
            <Input
              value={taskTitle}
              onChange={(e) => handleTaskTitleChange(e.target.value)}
              placeholder="Enter task name..."
              className="h-14 rounded-[1.25rem] border-white/[0.1] bg-white/[0.03] focus-visible:ring-white/10 text-lg font-bold px-7 placeholder:text-white/10 transition-all"
              autoFocus
            />
          </div>

          {/* Priority + Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 pl-1">Priority</Label>
              <Select value={manualPriority} onValueChange={setManualPriority}>
                <SelectTrigger className="h-12 rounded-[1.25rem] border-white/[0.1] bg-white/[0.03] text-[10px] font-bold uppercase tracking-widest px-7">
                  <SelectValue placeholder="Detecting..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/10 bg-[#0a0a0c]/98 p-1 shadow-2xl">
                  <SelectItem value="none" className="rounded-lg py-3 text-[10px] font-bold uppercase tracking-widest">Auto Detect</SelectItem>
                  <SelectItem value="high" className="rounded-lg py-3 text-[10px] font-bold uppercase tracking-widest text-rose-500/80">High</SelectItem>
                  <SelectItem value="medium" className="rounded-lg py-3 text-[10px] font-bold uppercase tracking-widest text-blue-400/80">Medium</SelectItem>
                  <SelectItem value="low" className="rounded-lg py-3 text-[10px] font-bold uppercase tracking-widest text-white/20">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 pl-1">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 rounded-[1.25rem] border-white/[0.1] bg-white/[0.03] text-[10px] font-bold uppercase tracking-widest px-7">
                  <SelectValue placeholder="General" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/10 bg-[#0a0a0c]/98 p-1 shadow-2xl max-h-[240px]">
                  <SelectItem value="none" className="rounded-lg py-3 text-[10px] font-bold uppercase tracking-widest">General</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-lg py-3 text-[10px] font-bold uppercase tracking-widest text-white/60">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time protocol */}
          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 pl-1 flex items-center gap-2">
              <Clock className="w-3 h-3 opacity-30" /> Due Date
            </Label>
            <Input
              type="datetime-local"
              value={deadlineInputValue}
              onChange={(e) => handleDeadlineChange(e.target.value)}
              className="h-12 rounded-[1.25rem] border-white/[0.1] bg-white/[0.03] text-[10px] font-bold uppercase tracking-widest px-7 text-white/60 transition-all"
            />
            <AnimatePresence>
              {selectedDeadline && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-4 px-6 py-4 rounded-[1.25rem] bg-blue-500/5 border border-blue-500/10"
                >
                  <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Due {formatRelativeDate(selectedDeadline)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reminder Logic */}
          {selectedDeadline && (
            <div className="space-y-6 pt-10 border-t border-white/[0.05]">
              <div className="flex items-center gap-3 text-white/10 mb-2 px-1">
                 <Zap className="w-3.5 h-3.5 opacity-30" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Notifications</span>
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

          <div className="px-10 py-6 bg-black/20 flex gap-4 flex-shrink-0 items-center justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="py-2 px-6 h-10 rounded-full text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !taskTitle.trim()}
              className="py-2 px-8 h-10 rounded-full text-sm font-medium bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  {isEditing ? 'Update Task' : 'Establish Task'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
