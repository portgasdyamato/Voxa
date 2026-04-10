import { useState } from 'react';
import { Task } from '@/types/task';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Check, MoreHorizontal, Calendar, Zap, AlertCircle, Box } from 'lucide-react';
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
    high: { color: 'text-rose-500', icon: AlertCircle },
    medium: { color: 'text-blue-400', icon: Zap },
    low: { color: 'text-white/20', icon: Check }
  };

  const pm = priorityMeta[task.priority as keyof typeof priorityMeta];

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        whileHover={{ y: -1 }}
        onClick={() => setIsEditModalOpen(true)}
        className="task-node group cursor-pointer"
      >
        <div className={cn(
          "task-node-inner transition-all duration-500 p-5 md:p-6",
          task.completed ? "opacity-30 grayscale" : "opacity-100"
        )}>
          <div className="flex items-start gap-5 w-full">
            <button 
              onClick={(e) => { e.stopPropagation(); handleToggleComplete(); }}
              className={cn(
                "w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-500 relative shrink-0",
                task.completed 
                  ? "bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                  : "bg-white/5 border-white/10 hover:border-white/30"
              )}
            >
              <AnimatePresence mode="wait">
                {task.completed && (
                  <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="w-3.5 h-3.5 text-white stroke-[4px]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h3 className={cn(
                  "text-lg md:text-xl font-bold tracking-tight text-white transition-all",
                  task.completed && "line-through text-white/20"
                )}>
                  {task.title}
                </h3>
                
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-white/10 hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0a0a0c]/95 border-white/10 rounded-xl">
                        <DropdownMenuItem onClick={() => deleteTask.mutate(task.id)} className="text-rose-500 text-[10px] font-bold uppercase tracking-widest py-3 px-4 px-4 uppercase tracking-widest py-3 px-4">Delete Task</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {category && (
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{category.name}</span>
                  </div>
                )}
                
                {task.dueDate && (
                  <div className={cn("flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20", isOverdue && !task.completed ? "text-rose-500/60" : "")}>
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(task.dueDate), 'MMM dd • HH:mm')}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                   <div className={cn("w-1 h-1 rounded-full", pm.color.replace('text-', 'bg-'), "opacity-40")} />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">{task.priority}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <ManualTaskModal
        task={task}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </>
  );
}
