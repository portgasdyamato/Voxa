import { useState } from 'react';
import { Task } from '@/types/task';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Check, MoreVertical, Clock, Zap, Target, Calendar } from 'lucide-react';
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

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: categories } = useCategories();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const category = categories?.find(c => c.id === task.categoryId);

  const handleToggleComplete = () => {
    updateTask.mutate({ 
      id: task.id, 
      updates: { completed: !task.completed } 
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <div
        className={cn(
          "premium-card relative p-6 pl-8 transition-all duration-300",
          task.completed ? "opacity-50" : "opacity-100"
        )}
      >
        {/* Priority Marker */}
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300",
            task.priority === 'high' ? "bg-rose-500 shadow-[2px_0_10px_rgba(244,63,94,0.2)]" :
            task.priority === 'medium' ? "bg-amber-500/50" :
            "bg-emerald-500/40"
          )}
        />

        <div className="flex items-start gap-6 relative z-10">
          <button 
            onClick={handleToggleComplete}
            className={cn(
              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shrink-0 mt-1",
              task.completed 
                ? "bg-primary border-primary shadow-lg shadow-primary/20" 
                : "border-border hover:border-primary/50 bg-background/50"
            )}
          >
            <AnimatePresence mode="wait">
              {task.completed && (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-white stroke-[3px]" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className={cn(
                  "text-lg font-bold tracking-tight transition-all",
                  task.completed ? "line-through text-muted-foreground font-medium" : "text-foreground"
                )}>
                  {task.title}
                </h3>
                {task.description && (
                   <p className="text-xs font-medium text-muted-foreground/60 line-clamp-1 italic">
                     {task.description}
                   </p>
                )}
              </div>

              <div className="shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-5 h-5 text-muted-foreground/40" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 p-2 rounded-2xl border-border shadow-2xl glass">
                    <DropdownMenuItem 
                      onClick={() => setIsEditModalOpen(true)}
                      className="rounded-xl font-semibold text-xs gap-3 py-2.5"
                    >
                      <Edit2 className="w-4 h-4" /> Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteTask.mutate(task.id)}
                      className="rounded-xl font-semibold text-xs gap-3 py-2.5 text-rose-500 focus:text-rose-500 focus:bg-rose-500/5"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {category && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border/50">
                   <div 
                      className="w-2 h-2 rounded-full shadow-sm" 
                      style={{ backgroundColor: category.color }} 
                   />
                   <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">{category.name}</span>
                </div>
              )}
              
              <div className={cn(
                  "text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border",
                  task.priority === 'high' ? "text-rose-600 border-rose-500/20 bg-rose-500/5" :
                  task.priority === 'medium' ? "text-amber-600 border-amber-500/20 bg-amber-500/5" :
                  "text-emerald-600 border-emerald-500/20 bg-emerald-500/5"
                )}
              >
                {task.priority} Priority
              </div>

              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border/50 text-[10px] font-bold uppercase tracking-widest",
                  isOverdue ? "text-rose-500 border-rose-500/20 bg-rose-500/5" : "text-muted-foreground/50"
                )}>
                  {isOverdue ? <Zap className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {format(new Date(task.dueDate), 'MMM d, p')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ManualTaskModal
        task={task}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </motion.div>
  );
}
