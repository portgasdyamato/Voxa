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
          "premium-card p-6 pl-10 border-l-4 transition-all duration-700 relative",
          task.completed ? "opacity-30 blur-[0.5px] pointer-events-none scale-[0.98]" : "opacity-100",
          task.priority === 'high' ? "border-l-rose-500" :
          task.priority === 'medium' ? "border-l-amber-500" :
          "border-l-emerald-500"
        )}
      >
        <div className="flex items-center gap-8">
          {/* Custom Interaction Node: Checkbox */}
          <button 
            onClick={handleToggleComplete}
            className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 shrink-0 relative overflow-hidden",
              task.completed 
                ? "bg-primary border-primary shadow-lg shadow-primary/30 rotate-12 scale-110" 
                : "border-white/10 hover:border-primary/40 bg-white/[0.02] hover:scale-105 active:scale-90"
            )}
          >
            <AnimatePresence mode="wait">
              {task.completed ? (
                <motion.div key="check" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                  <Check className="w-4 h-4 text-white stroke-[4px]" />
                </motion.div>
              ) : (
                <motion.div key="circle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors" />
              )}
            </AnimatePresence>
          </button>

          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden">
            <div className="space-y-2 flex-1 min-w-0">
               <div className="flex items-center flex-wrap gap-4">
                  <h3 className={cn(
                    "text-xl font-bold tracking-tight transition-all duration-500 truncate",
                    task.completed ? "line-through text-white/10 italic" : "text-white"
                  )}>
                    {task.title}
                  </h3>
                  {category && (
                    <div className="px-3 py-1 rounded-full bg-black/40 border border-white/[0.05] flex items-center gap-2 shrink-0">
                       <span 
                         className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" 
                         style={{ backgroundColor: category.color, color: category.color }} 
                       />
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 italic">{category.name}</span>
                    </div>
                  )}
               </div>
               
               <div className="flex items-center flex-wrap gap-6 text-[10px] uppercase font-black tracking-widest text-white/20 italic">
                  <span className={cn("px-2 py-0.5 rounded border transition-all duration-500", priorityColors[task.priority as keyof typeof priorityColors])}>
                    {task.priority} Priority
                  </span>
                  
                  {task.dueDate && (
                    <div className={cn("flex items-center gap-2", isOverdue ? "text-rose-500" : "")}>
                       <CalendarDays className="w-3.5 h-3.5" />
                       {format(new Date(task.dueDate), 'MMM d, h:mm a')}
                    </div>
                  )}

                  {task.reminder && (
                    <div className="flex items-center gap-2 text-primary/40">
                       <Clock className="w-3.5 h-3.5" />
                       Reminder Active
                    </div>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                variant="ghost" 
                size="icon" 
                className="h-11 w-11 rounded-2xl bg-white/[0.03] hover:bg-white/10 hover:border-white/10 border border-transparent transition-all"
              >
                <Edit2 className="w-4 h-4 text-white/20 group-hover:text-white" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-white/[0.03] hover:bg-white/10 hover:border-white/10 border border-transparent transition-all">
                    <MoreHorizontal className="w-4 h-4 text-white/20" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-[1.5rem] bg-[#080808]/90 backdrop-blur-3xl border-white/[0.05] shadow-3xl">
                  <DropdownMenuItem 
                    onClick={() => deleteTask.mutate(task.id)}
                    className="rounded-xl font-bold text-[10px] uppercase tracking-widest gap-4 py-3 text-rose-500/80 focus:text-rose-500 focus:bg-rose-500/5 cursor-pointer italic px-4"
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
