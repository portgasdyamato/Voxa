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
import { X, Calendar, Clock, Sparkles, Tag, AlertCircle } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('none');
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);
  const [deadlineInputValue, setDeadlineInputValue] = useState('');
  const [manualPriority, setManualPriority] = useState<string>('none');
  
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderType, setReminderType] = useState<'manual' | 'morning' | 'default'>('default');
  const [reminderTime, setReminderTime] = useState<string>('09:00');
  
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  useEffect(() => {
    if (task && open) {
      setTaskTitle(task.title || '');
      setTaskDescription(task.description || '');
      setSelectedCategory(task.categoryId?.toString() || 'none');
      setManualPriority(task.priority || 'none');
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        setSelectedDeadline(date);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        setDeadlineInputValue(`${year}-${month}-${day}T${hours}:${minutes}`);
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
    setTaskTitle(value);
    if (value.trim() && !isEditing && !selectedDeadline) {
      const dateResult = detectDateFromText(value);
      if (dateResult.detectedDate && dateResult.confidence === 'high') {
        const date = dateResult.detectedDate;
        setSelectedDeadline(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        setDeadlineInputValue(`${year}-${month}-${day}T${hours}:${minutes}`);
      }
    }
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      toast({ title: "Naming required", description: "Every task needs a title.", variant: "destructive" });
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
        await updateTask.mutateAsync({ id: task.id, updates: payload });
        toast({ title: "Task updated" });
      } else {
        await createTask.mutateAsync(payload);
        toast({ title: "Task created" });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Save error:", error);
      toast({ title: "Failed to save", description: "There was an error updating the task.", variant: "destructive" });
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
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl border-border/40 shadow-2xl">
        <DialogHeader className="p-8 pb-4 border-b border-border/10">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {isEditing ? 'Edit Task' : 'New Task'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Set the details for your objective.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-0.5">Title</Label>
            <Input
              value={taskTitle}
              onChange={(e) => handleTaskTitleChange(e.target.value)}
              placeholder="What needs to be done?"
              className="h-11 rounded-xl border-border/50 bg-muted/20 focus-visible:ring-primary/20 text-base font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-0.5">Description</Label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Add more details..."
              className="w-full min-h-[100px] rounded-xl border border-border/50 bg-muted/20 p-4 focus:outline-none focus:border-primary/30 text-sm font-medium transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Priority
              </Label>
              <Select value={manualPriority} onValueChange={setManualPriority}>
                <SelectTrigger className="h-10 rounded-xl border-border/50 bg-muted/20 text-sm font-medium">
                  <SelectValue placeholder="Auto" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none">Auto-detect</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-0.5 flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> Category
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-10 rounded-xl border-border/50 bg-muted/20 text-sm font-medium">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-[240px]">
                  <SelectItem value="none">None</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
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

          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-0.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> Due Date
            </Label>
            <div className="relative group">
              <Input
                type="datetime-local"
                value={deadlineInputValue}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                className="h-10 rounded-xl border-border/50 bg-muted/20 text-sm font-medium transition-all focus:bg-background"
              />
            </div>
            {selectedDeadline && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 text-[11px] font-semibold text-primary">
                <Clock className="w-3 h-3" />
                Due {formatRelativeDate(selectedDeadline)}
              </div>
            )}
          </div>

          {selectedDeadline && (
            <div className="pt-4 border-t border-border/20">
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

        <div className="p-6 bg-muted/30 border-t border-border/40 flex gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl h-10 font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveTask}
            disabled={createTask.isPending || updateTask.isPending}
            className="flex-1 rounded-xl h-10 font-bold"
          >
            {(createTask.isPending || updateTask.isPending) ? 'Saving...' : 'Save Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
