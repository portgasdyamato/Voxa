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
            "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 relative overflow-hidden shrink-0",
            task.completed 
              ? "bg-primary border-primary shadow-[0_0_20px_rgba(59,130,246,0.4)]" 
              : "border-white/5 bg-white/[0.02] hover:border-primary/40"
          )}
        >
          <AnimatePresence mode="wait">
            {task.completed ? (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Check className="w-5 h-5 text-white stroke-[4px]" />
              </motion.div>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-all group-hover:scale-150" />
            )}
          </AnimatePresence>
        </button>

        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className={cn(
                "text-[17px] font-bold tracking-tight truncate",
                task.completed ? "text-white/20" : "text-white group-hover:text-primary transition-colors"
              )}>
                {task.title}
              </h3>
              {category && (
                <div 
                  className="px-2.5 py-0.5 rounded-lg border border-white/[0.05] bg-black/40 flex items-center gap-2"
                  style={{ color: category.color }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{category.name}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/20">
              <div className={cn("flex items-center gap-1.5", pm.color)}>
                <pm.icon className="w-3.5 h-3.5" />
                <span>{task.priority}</span>
              </div>
              
              {task.dueDate && (
                <div className={cn("flex items-center gap-1.5", isOverdue && !task.completed ? "text-rose-500 animate-pulse" : "")}>
                  <Calendar className="w-3.5 h-3.5" />
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
              className="h-10 w-10 rounded-xl hover:bg-white/5"
            >
              <Edit2 className="w-3.5 h-3.5 text-white/40 group-hover:text-white" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5">
                  <MoreHorizontal className="w-3.5 h-3.5 text-white/40" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl bg-[#0c0c0e] border border-white/[0.08]">
                <DropdownMenuItem 
                  onClick={() => deleteTask.mutate(task.id)}
                  className="rounded-xl font-bold text-[10px] uppercase tracking-widest gap-3 py-3 text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 cursor-pointer"
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
