import { useState } from 'react';
import { Task } from '@/types/task';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Check, MoreVertical, Clock, Zap, Target, CalendarDays, Share2, CornerUpRight } from 'lucide-react';
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

  const priorityColors = {
    high: 'text-rose-400 border-rose-500/10 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.05)]',
    medium: 'text-amber-400 border-amber-500/10 bg-amber-500/5',
    low: 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <div
        className={cn(
          "premium-card p-5 pl-8 transition-all duration-500 relative inner-glow group-hover:bg-[#080808]",
          task.completed ? "opacity-30 grayscale blur-[0.5px] pointer-events-none" : "opacity-100"
        )}
      >
        {/* Precision Priority Strip */}
        <div 
          className={cn(
            "absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full transition-all duration-700",
            task.priority === 'high' ? "bg-rose-500 shadow-[2px_0_20px_rgba(244,63,94,0.3)]" :
            task.priority === 'medium' ? "bg-amber-500/30" :
            "bg-emerald-500/20"
          )}
        />

        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={handleToggleComplete}
            className={cn(
              "w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-500 shrink-0",
              task.completed 
                ? "bg-primary border-primary shadow-lg shadow-primary/20" 
                : "border-white/10 hover:border-primary/40 bg-white/[0.02] hover:scale-105"
            )}
          >
            <AnimatePresence mode="wait">
              {task.completed && (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-white stroke-[3px]" />
                </motion.div>
              )}
            </AnimatePresence>
            {!task.completed && <div className="w-1 h-1 rounded-full bg-white/5 group-hover:bg-primary transition-colors" />}
          </button>

          <div className="flex-1 min-w-0 flex items-center gap-6">
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-3">
                  <h3 className={cn(
                    "text-lg font-bold tracking-tight transition-all duration-500 truncate",
                    task.completed ? "line-through text-white/10" : "text-white group-hover:text-primary"
                  )}>
                    {task.title}
                  </h3>
                  {category && (
                    <div className="px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center gap-1.5 shrink-0">
                       <div className="w-1 h-1 rounded-full" style={{ backgroundColor: category.color }} />
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{category.name}</span>
                    </div>
                  )}
               </div>
               
               <div className="flex items-center gap-4 mt-2">
                  <div className={cn(
                      "text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md border flex items-center gap-2",
                      priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium
                    )}
                  >
                    <div className="w-1 h-1 rounded-full bg-current" />
                    {task.priority}
                  </div>

                  {task.dueDate && (
                    <div className={cn(
                      "flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em]",
                      isOverdue ? "text-rose-500 animate-pulse" : "text-white/20"
                    )}>
                      {isOverdue ? <Zap className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                      {format(new Date(task.dueDate), 'MMM d, h:mm a')}
                    </div>
                  )}
               </div>
            </div>

            {/* Desktop Actions Hub */}
            <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500">
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5"
              >
                <Edit2 className="w-3.5 h-3.5 text-white/30 group-hover:text-white" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5">
                    <MoreVertical className="w-3.5 h-3.5 text-white/30" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-white/[0.05] bg-[#0a0a0a]/90 backdrop-blur-3xl shadow-3xl">
                  <DropdownMenuItem 
                    onClick={() => deleteTask.mutate(task.id)}
                    className="rounded-xl font-bold text-[9px] uppercase tracking-widest gap-3 py-3 text-rose-500/80 focus:text-rose-500 focus:bg-rose-500/5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Purge Node
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
