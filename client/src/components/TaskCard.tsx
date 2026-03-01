import { useState } from 'react';
import { Task } from '@/types/task';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Check, MoreVertical, Clock, Zap, Target } from 'lucide-react';
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.4 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <div
        className={cn(
          "premium-card relative p-8 pl-10 transition-all duration-700 overflow-hidden",
          task.completed ? "opacity-40" : "opacity-100"
        )}
      >
        {/* Animated Shine Effect */}
        <motion.div 
          className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none"
          animate={{ x: isHovered ? ['-100%', '200%'] : '-100%' }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Priority Indicator - Vertical Line */}
        <motion.div 
          className={cn(
            "absolute left-0 top-0 bottom-0 w-2 z-10",
            task.priority === 'high' ? "bg-rose-500 shadow-[2px_0_20px_rgba(244,63,94,0.4)]" :
            task.priority === 'medium' ? "bg-amber-500/60" :
            "bg-emerald-500/40"
          )}
          animate={{ width: isHovered ? 4 : 2 }}
        />

        <div className="flex items-start gap-8 relative z-10">
          <motion.button 
            onClick={handleToggleComplete}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 shrink-0 mt-1",
              task.completed 
                ? "bg-primary border-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]" 
                : "border-white/10 hover:border-primary/50 bg-white/5"
            )}
          >
            <AnimatePresence mode="wait">
              {task.completed ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                >
                  <Check className="w-5 h-5 text-white stroke-[4px]" />
                </motion.div>
              ) : (
                <motion.div
                  key="dot"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors"
                />
              )}
            </AnimatePresence>
          </motion.button>

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <h3 className={cn(
                  "text-xl font-black tracking-tight transition-all duration-700 flex items-center gap-3",
                  task.completed && "line-through text-muted-foreground/50 opacity-50"
                )}>
                  <span className="truncate">{task.title}</span>
                  {!task.completed && isHovered && (
                     <motion.div
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                     >
                       <Target className="w-4 h-4 text-primary animate-pulse" />
                     </motion.div>
                  )}
                </h3>
                {task.description && (
                   <p className="text-xs font-medium text-muted-foreground/60 line-clamp-1 italic">
                     {task.description}
                   </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 hover:scale-110 active:scale-95">
                      <MoreVertical className="w-5 h-5 text-muted-foreground/60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-2 glass rounded-[2rem] border-white/5 shadow-2xl">
                    <DropdownMenuItem 
                      onClick={() => setIsEditModalOpen(true)}
                      className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-3 py-3 focus:bg-primary/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" /> Refine Node
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteTask.mutate(task.id)}
                      className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-3 py-3 text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Purge Asset
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              {category && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                   <div 
                      className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" 
                      style={{ backgroundColor: category.color, color: category.color }} 
                   />
                   <span className="text-[10px] font-black uppercase tracking-widest italic text-primary/80">{category.name}</span>
                </div>
              )}
              
              <div className={cn(
                  "text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-xl border shadow-sm",
                  task.priority === 'high' ? "text-rose-500 border-rose-500/30 bg-rose-500/10" :
                  task.priority === 'medium' ? "text-amber-500 border-amber-500/30 bg-amber-500/10" :
                  "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                )}
              >
                {task.priority.toUpperCase()} PROTOCOL
              </div>

              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10",
                  isOverdue ? "text-rose-500 border-rose-500/20 bg-rose-500/5 animate-pulse" : "text-muted-foreground/60"
                )}>
                  {isOverdue ? <Zap className="w-4 h-4" /> : <Clock className="w-4 h-4 shadow-sm" />}
                  {format(new Date(task.dueDate), 'MMM d, p')}
                </div>
              )}
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

