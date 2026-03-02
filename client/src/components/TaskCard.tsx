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
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => setIsEditModalOpen(true)}
      className="task-node group cursor-pointer"
      style={{ '--glow-color': task.completed ? '#3b82f6' : (category?.color || '#3b82f6') } as React.CSSProperties}
    >
      <div className={cn(
        "task-node-inner transition-all duration-200",
        task.completed ? "opacity-50" : "opacity-100"
      )}>
        <button 
          onClick={(e) => { e.stopPropagation(); handleToggleComplete(); }}
          className={cn(
            "w-7 h-7 rounded-[10px] border flex items-center justify-center transition-all duration-300 relative overflow-hidden shrink-0 group/btn backdrop-blur-md",
            task.completed 
              ? "bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
              : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/30"
          )}
        >
          <AnimatePresence mode="wait">
            {task.completed ? (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Check className="w-4 h-4 text-primary stroke-[4px] drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
              </motion.div>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover/btn:bg-white/80 transition-all duration-300 group-hover/btn:scale-[1.5]" />
            )}
          </AnimatePresence>
        </button>

        <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className={cn(
                "text-[14px] font-medium tracking-tight",
                task.completed ? "text-white/40 line-through" : "text-white"
              )}>
                {task.title}
              </h3>
              {category && (
                <div 
                  className="flex items-center gap-1.5"
                  style={{ color: category.color }}
                >
                  <div className="w-2 h-2 rounded-[3px] bg-current opacity-80" />
                  <span className="text-[12px] font-medium text-white/50">{category.name}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] sm:text-[12px] font-bold sm:font-medium text-white/40">
              <div className={cn("flex items-center gap-1", pm.color)}>
                <pm.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="capitalize">{task.priority}</span>
              </div>
              
              {task.dueDate && (
                <div className={cn("flex items-center gap-1", isOverdue && !task.completed ? "text-rose-500" : "")}>
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70" />
                  <span className="whitespace-nowrap">{format(new Date(task.dueDate), 'MMM d, h:mm a')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[8px] hover:bg-white/10 shadow-none text-white/50 hover:text-white transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 shadow-2xl border border-white/[0.08] bg-[#111114] rounded-xl p-1.5">
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); deleteTask.mutate(task.id); }}
                  className="rounded-lg font-medium text-[12px] gap-2.5 py-2 text-rose-500 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer shadow-none"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
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
