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
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        onClick={() => setIsEditModalOpen(true)}
        className="task-node group cursor-pointer"
        style={{ '--glow-color': task.completed ? '#3b82f6' : (category?.color || '#3b82f6') } as React.CSSProperties}
      >
        <div className={cn(
          "task-node-inner transition-all duration-[800ms]",
          task.completed ? "opacity-30 pointer-events-none" : "opacity-100"
        )}>
          <button 
            onClick={(e) => { e.stopPropagation(); handleToggleComplete(); }}
            className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-[1rem] md:rounded-[1.25rem] border flex items-center justify-center transition-all duration-700 relative overflow-hidden shrink-0 group/btn backdrop-blur-xl",
              task.completed 
                ? "bg-blue-500/10 border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.3)]" 
                : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
            )}
          >
             <div className="absolute inset-x-0 top-0 h-px bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <AnimatePresence mode="wait">
              {task.completed ? (
                <motion.div key="check" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}>
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-blue-400 stroke-[3px]" />
                </motion.div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-white/10 group-hover/btn:bg-white group-hover/btn:scale-[1.8] transition-all duration-700" />
              )}
            </AnimatePresence>
          </button>

          <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-10">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <h3 className={cn(
                  "text-[16px] md:text-[20px] font-black tracking-tight text-white",
                  task.completed && "opacity-40"
                )}>
                  {task.title}
                </h3>
                {category && (
                  <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 py-1 px-3 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color, boxShadow: `0 0 10px ${category.color}` }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{category.name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                <div className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]", pm.color)}>
                  <pm.icon className="w-3.5 h-3.5 opacity-40" />
                  <span>{task.priority} Priority</span>
                </div>
                
                {task.dueDate && (
                  <div className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20", isOverdue && !task.completed ? "text-rose-500/60" : "")}>
                    <Calendar className="w-3.5 h-3.5 opacity-40" />
                    <span className="whitespace-nowrap">{format(new Date(task.dueDate), 'MMM dd • HH:mm')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-700" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-[1rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/5 text-white/20 hover:text-white transition-all duration-500">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#0a0a0c]/90 backdrop-blur-[40px] border-white/10 rounded-[1rem] p-1.5 shadow-3xl">
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); deleteTask.mutate(task.id); }}
                    className="rounded-lg font-black text-[10px] uppercase tracking-widest gap-4 py-3 text-rose-500 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Access
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
