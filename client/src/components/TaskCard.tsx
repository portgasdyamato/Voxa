import { useState } from 'react';
import { Task } from '@/types/task';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Check, MoreHorizontal, Calendar, Zap, AlertCircle } from 'lucide-react';
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const category = categories?.find(c => c.id === task.categoryId);

  const handleToggleComplete = () => {
    updateTask.mutate({ 
      id: task.id, 
      updates: { completed: !task.completed } 
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  const priorityMeta = {
    high: { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', icon: AlertCircle },
    medium: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: Zap },
    low: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: Check }
  };

  const pm = priorityMeta[task.priority as keyof typeof priorityMeta];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="task-node group"
    >
      <div className={cn(
        "task-node-inner transition-all duration-500",
        task.completed ? "opacity-30 grayscale blur-[0.3px]" : "opacity-100"
      )}>
        {/* Status Indicator */}
        <button 
          onClick={handleToggleComplete}
          className={cn(
            "w-10 h-10 rounded-[0.85rem] border flex items-center justify-center transition-all duration-300 relative overflow-hidden shrink-0",
            task.completed 
              ? "bg-primary border-primary shadow-none" 
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] shadow-none"
          )}
        >
          <AnimatePresence mode="wait">
            {task.completed ? (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Check className="w-5 h-5 text-white stroke-[3px]" />
              </motion.div>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/40 transition-all group-hover:scale-125" />
            )}
          </AnimatePresence>
        </button>

        <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className={cn(
                "text-[15px] sm:text-[17px] font-bold tracking-tight truncate",
                task.completed ? "text-white/20" : "text-white"
              )}>
                {task.title}
              </h3>
              {category && (
                <div 
                  className="px-2.5 py-1 rounded-full border border-white/[0.03] bg-white/[0.03] flex items-center gap-1.5"
                  style={{ color: category.color }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">{category.name}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white/30">
              <div className={cn("flex items-center gap-1.5", pm.color)}>
                <pm.icon className="w-3.5 h-3.5" />
                <span>{task.priority}</span>
              </div>
              
              {task.dueDate && (
                <div className={cn("flex items-center gap-1.5", isOverdue && !task.completed ? "text-rose-500 animate-pulse" : "")}>
                  <Calendar className="w-3.5 h-3.5 opacity-50" />
                  <span>{format(new Date(task.dueDate), 'MMM d, h:mm a')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-xl hover:bg-white/5 shadow-none"
            >
              <Edit2 className="w-3.5 h-3.5 text-white/50 hover:text-white transition-colors" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5 shadow-none">
                  <MoreHorizontal className="w-4 h-4 text-white/50 hover:text-white transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 shadow-none border border-white/[0.05]">
                <DropdownMenuItem 
                  onClick={() => deleteTask.mutate(task.id)}
                  className="rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] gap-3 py-3 text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 cursor-pointer shadow-none relative"
                >
                  <Trash2 className="w-4 h-4" /> Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
