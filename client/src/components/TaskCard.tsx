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
          "task-node-inner transition-all duration-300 p-5 md:p-6 relative overflow-hidden",
          task.completed ? "opacity-30 grayscale" : "opacity-100"
        )}>
          {/* Bevel Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-20 pointer-events-none" />
          
          {/* Subtle Internal Glow Hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-start gap-5 w-full relative z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); handleToggleComplete(); }}
              className={cn(
                "w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 relative shrink-0",
                task.completed 
                  ? "bg-blue-500 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]" 
                  : "bg-white/5 border-white/10 hover:border-white/30"
              )}
            >
              <AnimatePresence mode="wait">
                {task.completed && (
                  <motion.div 
                    key="done-anim"
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Check className="w-3.5 h-3.5 text-white stroke-[4px]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <div className="flex-1 min-w-0 space-y-3.5">
              <div className="flex items-start justify-between gap-4">
                <h3 className={cn(
                  "text-lg md:text-xl font-semibold tracking-tight text-white transition-all duration-500",
                  task.completed && "line-through text-white/10"
                )}>
                  {task.title}
                </h3>
                
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-white/10 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"><MoreHorizontal className="w-4 h-4" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0a0a0c]/98 border-white/10 rounded-xl p-1 shadow-2xl">
                        <DropdownMenuItem onClick={() => deleteTask.mutate(task.id)} className="text-rose-500/90 focus:text-rose-500 focus:bg-rose-500/10 text-sm font-medium py-2 px-3 transition-colors cursor-pointer rounded-lg">Delete Task</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {category && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color, boxShadow: `0 0 8px ${category.color}40` }} />
                    <span className="text-xs font-medium text-white/40">{category.name}</span>
                  </div>
                )}
                
                {task.dueDate && (
                  <div className={cn("flex items-center gap-1.5 text-xs font-medium text-white/30", isOverdue && !task.completed ? "text-rose-500/80" : "")}>
                    <Calendar className="w-3.5 h-3.5 opacity-60" />
                    <span>{format(new Date(task.dueDate), 'MMM dd • HH:mm')}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                   <div className={cn("w-1.5 h-1.5 rounded-full bg-white/20")} />
                   <span className="text-xs font-medium text-white/40 capitalize">{task.priority}</span>
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
