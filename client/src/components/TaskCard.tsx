import { useState } from 'react';
import { Task } from '@/types/task';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trash2, Edit2, Check, MoreVertical, Clock, Zap } from 'lucide-react';
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
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <div
        className={cn(
          "premium-card relative overflow-hidden transition-all duration-500",
          task.completed && "opacity-40 grayscale-[0.5]"
        )}
      >
        {/* Priority Accent Line */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500",
          task.priority === 'high' ? "bg-rose-500 shadow-[2px_0_10px_rgba(244,63,94,0.3)]" :
          task.priority === 'medium' ? "bg-amber-500/50" :
          "bg-emerald-500/30"
        )} />

        <div className="flex items-center gap-6 p-6 pl-8">
          <button 
            onClick={handleToggleComplete}
            className={cn(
              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-500 shrink-0",
              task.completed 
                ? "bg-primary border-primary shadow-lg shadow-primary/20" 
                : "border-border/30 hover:border-primary/50 bg-muted/20"
            )}
          >
            <AnimatePresence>
              {task.completed && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 45 }}
                >
                  <Check className="w-4 h-4 text-primary-foreground stroke-[3.5px]" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h3 className={cn(
                "text-base font-black tracking-tight truncate transition-all duration-500 italic",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-muted/50 transition-all">
                      <MoreVertical className="w-5 h-5 text-muted-foreground/60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 p-2 glass rounded-2xl border-white/5">
                    <DropdownMenuItem 
                      onClick={() => setIsEditModalOpen(true)}
                      className="rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2 py-2.5 focus:bg-primary/10"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Reconfigure
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteTask.mutate(task.id)}
                      className="rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2 py-2.5 text-rose-500 focus:text-rose-500 focus:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Terminate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {category && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border/10">
                   <div 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: category.color }} 
                   />
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">{category.name}</span>
                </div>
              )}
              
              <div className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border",
                  task.priority === 'high' ? "text-rose-500 border-rose-500/20 bg-rose-500/5 shadow-sm shadow-rose-500/10" :
                  task.priority === 'medium' ? "text-amber-500 border-amber-500/20 bg-amber-500/5" :
                  "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                )}
              >
                {task.priority} PLD
              </div>

              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-2 px-2.5 py-1 rounded-lg bg-muted/20 border border-border/10 text-[10px] font-black uppercase tracking-widest",
                  isOverdue ? "text-rose-500 border-rose-500/10" : "text-muted-foreground/60"
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

