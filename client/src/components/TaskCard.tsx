import { useState } from 'react';
import { Task } from '@/types/task';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trash2, Edit2, Clock, Check, MoreVertical, Star, AlertCircle, Share2 } from 'lucide-react';
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
            title: "Objective Achieved",
            description: `Successfully completed "${task.title}".`,
          });
        }
      }
    });
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      {showConfetti && <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />}
      <Card
        className={cn(
          "premium-card border-border/30 overflow-hidden",
          task.completed ? "opacity-50 grayscale-[0.5]" : "hover:border-primary/30",
          isOverdue && "border-rose-500/20 bg-rose-500/[0.02]"
        )}
      >
        <div className="flex">
          {/* Side priority indicator */}
          <div className={cn(
            "w-1 transition-all duration-500 group-hover:w-1.5",
            task.priority === 'high' ? "bg-rose-500" : 
            task.priority === 'medium' ? "bg-amber-500" : 
            "bg-emerald-500",
            task.completed && "opacity-30"
          )} />

          <div className="flex-1 p-5 md:p-6 flex items-start gap-5">
            <div className="pt-1">
              <div 
                className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-300",
                  task.completed 
                    ? "bg-primary border-primary shadow-lg shadow-primary/20" 
                    : "border-muted-foreground/30 hover:border-primary bg-background/50"
                )}
                onClick={handleToggleComplete}
              >
                {task.completed && <Check className="w-3.5 h-3.5 text-primary-foreground stroke-[3px]" />}
              </div>
            </div>

            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className={cn(
                    "text-lg font-semibold tracking-tight transition-all truncate",
                    task.completed ? "text-muted-foreground line-through" : "text-foreground"
                  )}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground/80 line-clamp-1 group-hover:line-clamp-none transition-all">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl">
                      <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="rounded-lg gap-2 py-2">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteTask.mutate(task.id)} className="rounded-lg gap-2 py-2 text-rose-500 focus:text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {category && (
                  <CategoryBadge category={category} size="sm" />
                )}
                
                <Badge 
                  variant="outline" 
                  className={cn(
                    "rounded-md border px-2 py-0 text-[10px] font-bold uppercase tracking-wider",
                    priorityStyles[task.priority]
                  )}
                >
                  {task.priority}
                </Badge>

                {task.dueDate && (
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-muted/30",
                    isOverdue ? "text-rose-500 border-rose-500/20" : "text-muted-foreground border-transparent"
                  )}>
                    <Calendar className="w-3 h-3" />
                    {format(new Date(task.dueDate), 'MMM d, p')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <ManualTaskModal
        task={task}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </motion.div>
  );
}
