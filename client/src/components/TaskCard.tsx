import { useState } from 'react';
import { Task } from '@/types/task';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trash2, Edit2, Check, MoreVertical, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ManualTaskModal } from './ManualTaskModal';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryBadge } from '@/components/CategoryFilter';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: categories } = useCategories();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const category = categories?.find(c => c.id === task.categoryId);

  const handleToggleComplete = () => {
    updateTask.mutate({ 
      id: task.id, 
      updates: { completed: !task.completed } 
    }, {
      onSuccess: () => {
        if (!task.completed) {
          toast({
            title: "Task completed",
            description: `You've finished "${task.title}".`,
          });
        }
      }
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <motion.div
      layout
      className="group"
    >
      <Card
        className={cn(
          "transition-all border border-border/40 bg-card hover:border-primary/20 hover:shadow-sm overflow-hidden",
          task.completed && "opacity-50 grayscale-[0.8]"
        )}
      >
        <div className="flex items-center gap-4 p-4 md:p-5">
          <button 
            onClick={handleToggleComplete}
            className={cn(
              "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
              task.completed 
                ? "bg-primary border-primary" 
                : "border-muted-foreground/30 hover:border-primary"
            )}
          >
            {task.completed && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className={cn(
                "text-sm font-semibold truncate",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                    <Edit2 className="w-3 h-3 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => deleteTask.mutate(task.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {category && <CategoryBadge category={category} size="sm" />}
              
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider",
                  task.priority === 'high' ? "text-rose-500 border-rose-500/10" :
                  task.priority === 'medium' ? "text-amber-500 border-amber-500/10" :
                  "text-emerald-500 border-emerald-500/10"
                )}
              >
                {task.priority}
              </Badge>

              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-medium",
                  isOverdue ? "text-rose-500" : "text-muted-foreground"
                )}>
                  <Clock className="w-3 h-3" />
                  {format(new Date(task.dueDate), 'MMM d, p')}
                </div>
              )}
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
