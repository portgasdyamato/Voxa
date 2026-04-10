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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        onClick={() => setIsEditModalOpen(true)}
        className="task-node group cursor-pointer"
      >
        <div className={cn(
          "task-node-inner transition-all duration-[800ms] p-6 md:p-8",
          task.completed ? "opacity-30 grayscale" : "opacity-100"
        )}>
          {/* Status Node Connector */}
          <div className="flex items-center gap-6 md:gap-10 w-full mb-4">
            <button 
              onClick={(e) => { e.stopPropagation(); handleToggleComplete(); }}
              className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-full border flex items-center justify-center transition-all duration-700 relative group/btn",
                task.completed 
                  ? "bg-blue-500/20 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
                  : "bg-white/[0.03] border-white/10 hover:border-blue-500/30"
              )}
            >
              <AnimatePresence mode="wait">
                {task.completed ? (
                  <motion.div key="done-ic" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-blue-400 stroke-[3px]" />
                  </motion.div>
                ) : (
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/10 group-hover/btn:bg-blue-400 group-hover/btn:scale-125 transition-all duration-500" />
                )}
              </AnimatePresence>
            </button>

            <div className="flex-1 flex items-center justify-between min-w-0">
               <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <span className="text-[10px] font-black tracking-[0.4em] text-white/10 uppercase italic">Node {task.id.toString().padStart(3, '0')}</span>
                  <div className="h-px w-4 bg-white/5 hidden md:block" />
                  <div className="flex items-center gap-2">
                     <div className={cn("w-1.5 h-1.5 rounded-full", pm.color.replace('text-', 'bg-'))} />
                     <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] opacity-40")}>{task.priority} Priority</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-white/10 hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0a0a0c]/95 border-white/10 rounded-xl">
                      <DropdownMenuItem onClick={() => deleteTask.mutate(task.id)} className="text-rose-500 text-[10px] font-black uppercase tracking-widest py-3 px-4">Terminate Node</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-12 pl-[3.5rem] md:pl-[4.5rem]">
            <div className="space-y-4 flex-1">
              <h3 className={cn(
                "text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight",
                task.completed && "line-through text-white/20"
              )}>
                {task.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-6">
                {category && (
                  <div className="flex items-center gap-2.5">
                    <Box className="w-3.5 h-3.5 text-white/5" />
                    <span 
                      className="text-[10px] font-black uppercase tracking-[0.2em]"
                      style={{ color: category.color || '#3b82f6', opacity: 0.6 }}
                    >
                      {category.name}
                    </span>
                  </div>
                )}
                
                {task.dueDate && (
                  <div className={cn("flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/15", isOverdue && !task.completed ? "text-rose-500/40" : "")}>
                    <Calendar className="w-3.5 h-3.5 opacity-40" />
                    <span>{format(new Date(task.dueDate), 'MMM dd • HH:mm')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-4 py-2 px-5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-sm self-start md:self-auto">
               <div className="w-1 h-1 rounded-full bg-blue-500/40" />
               <span className="text-[9px] font-black tracking-[0.2em] text-white/20 uppercase whitespace-nowrap">Synchronized</span>
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
