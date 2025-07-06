import { useState } from 'react';
import { useCreateTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { detectPriority } from '@/lib/priorityDetection';
import { detectDateFromText, formatRelativeDate } from '@/lib/dateDetection';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ReminderSettings } from '@/components/ReminderSettings';
import { Edit3, X, Tag, Calendar, Clock, Sparkles } from 'lucide-react';

interface ManualTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualTaskModal({ open, onOpenChange }: ManualTaskModalProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);
  const [deadlineInputValue, setDeadlineInputValue] = useState('');
  const [detectedDate, setDetectedDate] = useState<Date | null>(null);
  const [manualPriority, setManualPriority] = useState<string>('');
  
  // Reminder settings state
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderType, setReminderType] = useState<'manual' | 'morning' | 'default'>('default');
  const [reminderTime, setReminderTime] = useState<string>('');
  
  const { toast } = useToast();
  
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  const createTask = useCreateTask();

  const handleTaskTitleChange = (value: string) => {
    setTaskTitle(value);
    
    // Auto-detect date from title
    if (value.trim()) {
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
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    const fullText = `${taskTitle} ${taskDescription}`.trim();
    const priority = manualPriority || detectPriority(fullText);
    
    try {
      await createTask.mutateAsync({
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        priority: priority as 'high' | 'medium' | 'low',
        categoryId: selectedCategory && selectedCategory !== 'none' ? parseInt(selectedCategory) : undefined,
        dueDate: selectedDeadline ? selectedDeadline.toISOString() : undefined,
        reminderEnabled,
        reminderType,
        reminderTime: reminderType === 'manual' ? reminderTime : undefined,
      });

      const deadlineText = selectedDeadline ? ` (due ${formatRelativeDate(selectedDeadline)})` : '';
      const reminderText = reminderEnabled ? 
        reminderType === 'manual' ? ` with reminder at ${reminderTime}` :
        reminderType === 'morning' ? ' with morning reminder' :
        ' with default reminder' : '';
      
      toast({
        title: "Task Created",
        description: `Task "${taskTitle}" has been created with ${priority} priority${deadlineText}${reminderText}`,
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeadlineChange = (value: string) => {
    setDeadlineInputValue(value);
    if (value) {
      const date = new Date(value);
      date.setHours(23, 59, 59, 999); // Set to end of day
      setSelectedDeadline(date);
    } else {
      setSelectedDeadline(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-pink-100 text-pink-800';
      case 'medium':
        return 'bg-purple-100 text-purple-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDetectedPriority = () => {
    if (manualPriority) return manualPriority;
    const fullText = `${taskTitle} ${taskDescription}`.trim();
    return fullText ? detectPriority(fullText) : 'medium';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only"></DialogTitle>
        <DialogDescription className="sr-only">
          Create a new task by typing
        </DialogDescription>
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto">
              <Edit3 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Add Task Manually</h3>
              <p className="text-gray-600 text-sm mt-1">Enter your task details below</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title" className="text-sm font-medium text-gray-700">
                Task Title *
              </Label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => handleTaskTitleChange(e.target.value)}
                placeholder="Enter task title..."
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description" className="text-sm font-medium text-gray-700">
                Description (Optional)
              </Label>
              <textarea
                id="task-description"
                value={taskDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTaskDescription(e.target.value)}
                placeholder="Add more details about your task..."
                className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority-select" className="text-sm font-medium text-gray-700 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Priority
              </Label>
              <div className="flex items-center space-x-2">
                <Select value={manualPriority} onValueChange={setManualPriority}>
                  <SelectTrigger id="priority-select" className="flex-1">
                    <SelectValue placeholder="Auto-detect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Auto-detect</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getPriorityColor(getDetectedPriority())
                }`}>
                  {getDetectedPriority().charAt(0).toUpperCase() + getDetectedPriority().slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-select" className="text-sm font-medium text-gray-700 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Category (Optional)
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category-select" className="w-full">
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline-input" className="text-sm font-medium text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Deadline (Optional)
              </Label>
              {detectedDate && (
                <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                  <Clock className="w-4 h-4" />
                  <span>Detected: {formatRelativeDate(detectedDate)}</span>
                </div>
              )}
              <Input
                id="deadline-input"
                type="date"
                value={deadlineInputValue}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                className="w-full"
                min={new Date().toISOString().split('T')[0]}
              />
              {selectedDeadline && (
                <p className="text-xs text-gray-500">
                  Due: {formatRelativeDate(selectedDeadline)}
                </p>
              )}
            </div>

            {/* Reminder Settings */}
            {selectedDeadline && (
              <ReminderSettings
                reminderEnabled={reminderEnabled}
                reminderType={reminderType}
                reminderTime={reminderTime}
                onReminderEnabledChange={setReminderEnabled}
                onReminderTypeChange={setReminderType}
                onReminderTimeChange={setReminderTime}
              />
            )}

            <div className="flex space-x-3 pt-2">
              <Button
                onClick={handleSaveTask}
                disabled={createTask.isPending || !taskTitle.trim()}
                className="flex-1 gradient-primary text-white hover:opacity-90"
              >
                {createTask.isPending ? 'Creating...' : 'Create Task'}
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
