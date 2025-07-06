import { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { useUpdateTask, useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { formatRelativeDate, isOverdue, getDeadlineColor } from '@/lib/dateDetection';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { CategoryBadge } from '@/components/CategoryFilter';
import { Confetti } from '@/components/Confetti';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const { data: categories } = useCategories();
  const { data: allTasks } = useTasks();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const category = categories?.find(c => c.id === task.categoryId);

  // Check if all tasks for today are complete when this task is completed
  const checkAllTasksComplete = () => {
    if (!allTasks) return false;
    
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    
    const todayTasks = allTasks.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate >= startOfToday && dueDate < endOfToday;
    });
    
    const pendingTasks = todayTasks.filter(t => !t.completed && t.id !== task.id);
    return pendingTasks.length === 0;
  };

  const handleToggleComplete = async (checked: boolean) => {
    if (checked) {
      setIsAnimating(true);
      
      // Check if this completion will finish all tasks for today
      const allComplete = checkAllTasksComplete();
      
      setTimeout(() => {
        updateTask.mutate({
          id: task.id,
          updates: { completed: checked },
        }, {
          onSuccess: () => {
            if (allComplete) {
              setShowConfetti(true);
              toast({
                title: "🎉 All tasks complete!",
                description: "Congratulations! You've finished all your tasks for today!",
                duration: 5000,
              });
            } else {
              toast({
                title: "Task completed!",
                description: `"${task.title}" has been marked as completed.`,
                duration: 2000,
              });
            }
            setIsAnimating(false);
          },
          onError: (error) => {
            console.error('Failed to update task:', error);
            toast({
              title: "Error updating task",
              description: "Failed to update task status. Please try again.",
              variant: "destructive",
              duration: 3000,
            });
            setIsAnimating(false);
          }
        });
      }, 300); // Delay to show animation
    } else {
      updateTask.mutate({
        id: task.id,
        updates: { completed: checked },
      }, {
        onSuccess: () => {
          toast({
            title: "Task marked as pending",
            description: `"${task.title}" has been marked as pending.`,
            duration: 2000,
          });
        },
        onError: (error) => {
          console.error('Failed to update task:', error);
          toast({
            title: "Error updating task",
            description: "Failed to update task status. Please try again.",
            variant: "destructive",
            duration: 3000,
          });
        }
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      case 'medium':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300';
    }
  };

  const formatDueTime = (dueDate?: Date) => {
    if (!dueDate) return { text: 'No due date', color: 'text-gray-500 dark:text-gray-400', urgent: false };
    
    const due = new Date(dueDate);
    const relativeText = formatRelativeDate(due);
    const overdue = isOverdue(due);
    
    if (overdue) {
      return { text: `Overdue (${relativeText})`, color: 'text-red-600 dark:text-red-400', urgent: true };
    } else if (relativeText === 'Today') {
      return { text: 'Due today', color: 'text-orange-600 dark:text-orange-400', urgent: true };
    } else if (relativeText === 'Tomorrow') {
      return { text: 'Due tomorrow', color: 'text-yellow-600 dark:text-yellow-400', urgent: false };
    } else {
      return { text: `Due ${relativeText}`, color: 'text-gray-500 dark:text-gray-400', urgent: false };
    }
  };

  return (
    <>
      {showConfetti && <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />}
      <div className={`glass-effect rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-blue-100/50 dark:border-purple-200/30 ${
        isAnimating ? 'animate-task-complete' : ''
      }`}>
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="mt-1">
              <Checkbox
                checked={task.completed}
                onCheckedChange={handleToggleComplete}
                disabled={updateTask.isPending}
                className={`w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 transition-all duration-200 ${
                  isAnimating ? 'animate-checkbox-pop' : ''
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-medium transition-colors duration-200 ${
                  task.completed ? 'text-gray-500 line-through dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'
                }`}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-2">
                  {category && <CategoryBadge category={category} size="sm" />}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getPriorityColor(task.priority)
                  }`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
              </div>
              {task.description && (
                <p className={`text-sm mt-1 transition-colors duration-200 ${
                  task.completed ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {task.description}
                </p>
              )}
              <div className="flex items-center mt-2 text-xs">
                {task.completed ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    {(() => {
                      const dueInfo = formatDueTime(task.dueDate);
                      return (
                        <>
                          {dueInfo.urgent ? (
                            <AlertTriangle className="w-4 h-4 mr-1" />
                          ) : (
                            <Clock className="w-4 h-4 mr-1" />
                          )}
                          <span className={dueInfo.color}>{dueInfo.text}</span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
