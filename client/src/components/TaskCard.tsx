import { useState } from 'react';
import { Task } from '@/types/task';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trash2, Edit2, Clock, Check, MoreVertical, Star, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ManualTaskModal } from './ManualTaskModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryBadge } from '@/components/CategoryFilter';
import { Confetti } from '@/components/Confetti';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: categories } = useCategories();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const category = categories?.find(c => c.id === task.categoryId);

  const handleToggleComplete = () => {
    const newCompleted = !task.completed;
    updateTask.mutate({ 
      id: task.id, 
      updates: { completed: newCompleted } 
    }, {
      onSuccess: () => {
        if (newCompleted) {
          setShowConfetti(true);
          toast({
            title: "Task Completed! 🎉",
            description: `Great job finishing "${task.title}"!`,
          });
        }
      }
    });
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id);
  };

  const priorityStyles = {
    high: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    low: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <motion.div
      layout
      className="group relative"
    >
      {showConfetti && <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />}
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-500 border-2 rounded-[1.5rem] bg-card/40 backdrop-blur-xl",
          task.completed ? "opacity-60 grayscale-[0.3]" : "hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30",
          isOverdue ? "border-rose-500/30 bg-rose-500/[0.02]" : "border-border/40"
        )}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="relative flex items-center justify-center mt-1">
              <Checkbox
                checked={task.completed}
                onCheckedChange={handleToggleComplete}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all duration-500",
                  task.completed 
                    ? "bg-primary border-primary" 
                    : "border-muted-foreground/30 hover:border-primary"
                )}
              />
              <AnimatePresence>
                {task.completed && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute pointer-events-none"
                  >
                    <Check className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={cn(
                      "text-lg font-bold transition-all duration-500 truncate",
                      task.completed ? "line-through text-muted-foreground" : "text-foreground"
                    )}>
                      {task.title}
                    </h3>
                    {task.priority === 'high' && !task.completed && (
                      <Star className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                    )}
                  </div>
                  {task.description && (
                    <p className={cn(
                      "text-sm font-medium leading-relaxed line-clamp-2",
                      task.completed ? "text-muted-foreground/60" : "text-muted-foreground/80"
                    )}>
                      {task.description}
                    </p>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0 hover:bg-muted opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl border-2 p-1.5 shadow-xl backdrop-blur-xl">
                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="rounded-xl gap-2 font-bold focus:bg-primary/10 focus:text-primary">
                      <Edit2 className="w-4 h-4" /> Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="rounded-xl gap-2 font-bold text-rose-500 focus:bg-rose-500/10 focus:text-rose-500">
                      <Trash2 className="w-4 h-4" /> Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {category && (
                  <CategoryBadge category={category} size="sm" />
                )}
                
                <Badge variant="outline" className={cn("rounded-lg border-none px-2.5 py-0.5 font-bold uppercase text-[10px] tracking-wider", priorityStyles[task.priority])}>
                  {task.priority}
                </Badge>

                {task.dueDate && (
                  <div className={cn(
                    "flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-lg bg-muted/50",
                    isOverdue ? "text-rose-500 bg-rose-500/10" : "text-muted-foreground"
                  )}>
                    {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                    {format(new Date(task.dueDate), 'MMM d, h:mm a')}
                  </div>
                )}

                {task.isRecurring && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary/70 bg-primary/5 px-2 py-0.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    {task.recurringPattern}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Priority accent side glow */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          task.priority === 'high' ? "bg-rose-500" : task.priority === 'medium' ? "bg-amber-500" : "bg-emerald-500",
          task.completed && "opacity-20"
        )} />
      </Card>

      <ManualTaskModal
        task={task}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </motion.div>
  );
}
