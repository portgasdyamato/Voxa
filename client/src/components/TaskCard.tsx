import { useState } from 'react';
import { Task } from '@/types/task';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Check, MoreHorizontal, Clock, Target, CalendarDays, Share2, CornerUpRight, Zap } from 'lucide-react';
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

  const category = categories?.find(c => c.id === task.categoryId);

  const handleToggleComplete = () => {
    updateTask.mutate({ 
      id: task.id, 
      updates: { completed: !task.completed } 
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  const priorityColors = {
    high: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    low: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  };

  const priorityIcons = {
    high: <Zap className="w-3.5 h-3.5" />,
    medium: <Clock className="w-3.5 h-3.5" />,
    low: <CalendarDays className="w-3.5 h-3.5" />
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative"
    >
      <div
        className={cn(
          "premium-card p-6 pl-12 transition-all duration-700 relative hover:bg-white/[0.08] hover:border-white/[0.2]",
          task.completed ? "opacity-30 blur-[0.5px] pointer-events-none grayscale" : "opacity-100"
        )}
      >
        {/* Modern Accent Bar */}
        <div 
          className={cn(
            "absolute left-2 top-4 bottom-4 w-1.5 rounded-full shadow-2xl transition-all duration-700",
            task.priority === 'high' ? "bg-rose-500 shadow-[2px_0_20px_rgba(244,63,94,0.4)]" :
            task.priority === 'medium' ? "bg-amber-500 shadow-[2px_0_20px_rgba(245,158,11,0.2)]" :
            "bg-emerald-500 shadow-[2px_0_20px_rgba(16,185,129,0.2)]"
          )}
        />

        <div className="flex items-center gap-8">
          {/* Interaction Switch */}
          <button 
            onClick={handleToggleComplete}
            className={cn(
              "w-9 h-9 rounded-2xl border-2 flex items-center justify-center transition-all duration-700 shrink-0",
              task.completed 
                ? "bg-primary border-primary shadow-2xl shadow-primary/40 rotate-12" 
                : "border-white/10 hover:border-primary/40 bg-black/40 hover:scale-105 active:scale-90"
            )}
          >
            <AnimatePresence mode="wait">
              {task.completed ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-5 h-5 text-white stroke-[4px]" />
                </motion.div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-primary transition-colors" />
              )}
            </AnimatePresence>
          </button>

          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden">
            <div className="space-y-2 flex-1 min-w-0">
               <div className="flex items-center flex-wrap gap-4">
                  <h3 className={cn(
                    "text-xl font-black tracking-tight transition-all duration-700 truncate italic",
                    task.completed ? "line-through text-white/10" : "text-white group-hover:text-primary"
                  )}>
                    {task.title}
                  </h3>
                  {category && (
                    <div className="px-3 py-1 rounded-xl bg-black/60 border border-white/[0.1] flex items-center gap-2 group-hover:border-primary/20 transition-all">
                       <div 
                         className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentColor]" 
                         style={{ backgroundColor: category.color, color: category.color }} 
                       />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white/60 italic">{category.name}</span>
                    </div>
                  )}
               </div>
               
               <div className="flex items-center flex-wrap gap-8 text-[11px] uppercase font-black tracking-widest text-white/20 italic">
                  <div className={cn("flex items-center gap-2 px-3 py-1 rounded-lg border transition-all duration-700", priorityColors[task.priority as keyof typeof priorityColors])}>
                    {priorityIcons[task.priority as keyof typeof priorityIcons]}
                    <span>{task.priority}</span>
                  </div>
                  
                  {task.dueDate && (
                    <div className={cn("flex items-center gap-2 transition-colors duration-700", isOverdue ? "text-rose-500 animate-pulse" : "group-hover:text-white/40")}>
                       <CalendarDays className="w-4 h-4" />
                       {format(new Date(task.dueDate), 'MMM d, h:mm a')}
                    </div>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                variant="ghost" 
                size="icon" 
                className="h-11 w-11 rounded-xl bg-white/[0.03] hover:bg-white/10 hover:border-white/10 border border-transparent transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit2 className="w-4 h-4 text-white/20 group-hover:text-white" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-white/[0.03] hover:bg-white/10 hover:border-white/10 border border-transparent transition-all opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="w-4 h-4 text-white/20" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 p-2 rounded-[1.5rem] bg-[#0c0c0e]/95 backdrop-blur-3xl border-white/[0.1] shadow-3xl">
                  <DropdownMenuItem 
                    onClick={() => deleteTask.mutate(task.id)}
                    className="rounded-xl font-bold text-[10px] uppercase tracking-widest gap-4 py-3.5 text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 cursor-pointer italic px-4"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Task
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
