import { useState, useEffect } from 'react';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { detectPriority } from '@/lib/priorityDetection';
import { detectCategory, parseCategoryFromText } from '@/lib/categoryDetection';
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
    let currentTitle = value;
    
    if (value.trim()) {
      // 1. Auto-detect Category & Clean Title
      // We do this if no category is selected, OR if the title has a clear category hint while editing
      if ((selectedCategory === 'none' || !selectedCategory) && categories) {
        const { categoryId, cleanedText } = parseCategoryFromText(value, categories);
        if (categoryId) {
          setSelectedCategory(categoryId.toString());
          currentTitle = cleanedText;
        }
      }

      // 2. Auto-detect Date (only for new tasks to avoid accidental rescheduling)
      if (!isEditing && !selectedDeadline) {
        const dateResult = detectDateFromText(currentTitle);
        if (dateResult.detectedDate && dateResult.confidence === 'high') {
          const date = dateResult.detectedDate;
          setSelectedDeadline(date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          setDeadlineInputValue(`${year}-${month}-${day}T${hours}:${minutes}`);
          
          // Also clean the date text from the title
          currentTitle = dateResult.cleanedText;
        }
      }
    }
    
    setTaskTitle(currentTitle);
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
        await updateTask({ id: task.id, updates: payload });
        toast({ title: "Task updated" });
      } else {
        await createTask(payload);
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
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden glass border-white/5 shadow-3xl rounded-[2.5rem]">
        <DialogHeader className="p-10 pb-6 border-b border-white/5 relative bg-muted/20">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <Sparkles className="w-24 h-24" />
          </div>
          <DialogTitle className="text-3xl font-black tracking-tighter text-gradient italic">
            {isEditing ? 'RECONFIGURE' : 'INITIATE'} OBJECTIVE
          </DialogTitle>
          <DialogDescription className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-2">
            Mission-critical node configuration
          </DialogDescription>
        </DialogHeader>

        <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary px-1">Objective Vector (Title)</Label>
            <Input
              value={taskTitle}
              onChange={(e) => handleTaskTitleChange(e.target.value)}
              placeholder="e.g., Finalize orbital logistics"
              className="h-16 rounded-2xl border-white/5 bg-muted/30 focus-visible:ring-primary/20 text-lg font-black tracking-tight italic placeholder:not-italic placeholder:font-medium placeholder:opacity-30"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-1 italic">Contextual Metadata (Description)</Label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Append relevant operational data..."
              className="w-full min-h-[120px] rounded-2xl border border-white/5 bg-muted/30 p-5 focus:outline-none focus:border-primary/30 text-sm font-medium transition-all resize-none placeholder:opacity-30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-1 flex items-center gap-1.5 italic">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Priority Index
              </Label>
              <Select value={manualPriority} onValueChange={setManualPriority}>
                <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-muted/30 text-xs font-black uppercase tracking-widest pl-5">
                  <SelectValue placeholder="Auto" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl glass border-white/5">
                  <SelectItem value="none" className="rounded-xl font-bold text-[10px] uppercase tracking-widest py-3">AUTO-DETECT</SelectItem>
                  <SelectItem value="low" className="rounded-xl font-bold text-[10px] uppercase tracking-widest py-3 text-emerald-500">LOW PRIORITY</SelectItem>
                  <SelectItem value="medium" className="rounded-xl font-bold text-[10px] uppercase tracking-widest py-3 text-amber-500">MID PRIORITY</SelectItem>
                  <SelectItem value="high" className="rounded-xl font-bold text-[10px] uppercase tracking-widest py-3 text-rose-500">HIGH PRIORITY</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-1 flex items-center gap-1.5 italic">
                <Tag className="w-3.5 h-3.5 text-primary" /> Context Group
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-muted/30 text-xs font-black uppercase tracking-widest pl-5">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl glass border-white/5 max-h-[240px]">
                  <SelectItem value="none" className="rounded-xl font-bold text-[10px] uppercase tracking-widest py-3">UNCATEGORIZED</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl font-bold text-[10px] uppercase tracking-widest py-3">
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

          <div className="space-y-6">
            <div className="space-y-4">
               <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-1 flex items-center gap-1.5 italic">
                 <Calendar className="w-3.5 h-3.5 text-primary" /> Temporal Deadline
               </Label>
               <div className="relative group">
                 <Input
                   type="datetime-local"
                   value={deadlineInputValue}
                   onChange={(e) => handleDeadlineChange(e.target.value)}
                   className="h-14 rounded-2xl border-white/5 bg-muted-foreground/5 text-sm font-black tracking-tight transition-all focus:bg-background/40 pl-5"
                 />
               </div>
            </div>
            
            {selectedDeadline && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10"
              >
                <Clock className="w-4 h-4" />
                DUE IN: {formatRelativeDate(selectedDeadline)}
              </motion.div>
            )}
          </div>

          {selectedDeadline && (
            <div className="pt-8 border-t border-white/5">
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

        <div className="p-8 bg-muted/20 border-t border-white/5 flex gap-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 hover:bg-white/5"
          >
            Abort
          </Button>
          <Button
            onClick={handleSaveTask}
            disabled={isCreating || isUpdating}
            className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gradient-primary shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            {(isCreating || isUpdating) ? 'EXECUTING...' : `CONFIRM ${isEditing ? 'UPDATE' : 'INITIATION'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

