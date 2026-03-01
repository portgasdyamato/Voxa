import { useState } from 'react';
import { Task } from '@/types/task';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Check, MoreVertical, Clock, Zap, Target, CalendarDays, Share2, CornerUpRight } from 'lucide-react';
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

  const priorityColors = {
    high: 'text-rose-400 border-rose-500/20 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.1)]',
    medium: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    low: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <div
        className={cn(
          "premium-card p-8 pl-10 transition-all duration-700 relative inner-glow group-hover:bg-[#0a0a0a]",
          task.completed ? "opacity-40 grayscale pointer-events-none" : "opacity-100"
        )}
      >
        {/* Elite Priority Indicator */}
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 w-2.5 transition-all duration-700",
            task.priority === 'high' ? "bg-rose-500 shadow-[2px_0_40px_rgba(244,63,94,0.4)]" :
            task.priority === 'medium' ? "bg-amber-500/40" :
            "bg-emerald-500/30"
          )}
        />

        <div className="flex items-start gap-10 relative z-10">
          {/* Check Interaction */}
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={handleToggleComplete}
              className={cn(
                "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 shrink-0 shadow-2xl group",
                task.completed 
                  ? "bg-primary border-primary" 
                  : "border-white/10 hover:border-primary/50 bg-white/[0.03] hover:scale-110 active:scale-90"
              )}
            >
              <AnimatePresence mode="wait">
                {task.completed && (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="w-5 h-5 text-white stroke-[3px]" />
                  </motion.div>
                )}
              </AnimatePresence>
              {!task.completed && <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary transition-colors duration-500" />}
            </button>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white/10 to-transparent" />
          </div>

          <div className="flex-1 min-w-0 space-y-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className={cn(
                    "text-2xl font-black tracking-[-0.03em] transition-all duration-700",
                    task.completed ? "line-through text-white/20" : "text-white group-hover:text-primary"
                  )}>
                    {task.title}
                  </h3>
                  {category && (
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2"
                    >
                       <div 
                          className="w-1.5 h-1.5 rounded-full shadow-sm" 
                          style={{ backgroundColor: category.color }} 
                       />
                       <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">{category.name}</span>
                    </motion.div>
                  )}
                </div>
                {task.description && (
                   <p className="text-sm font-medium text-white/20 line-clamp-2 leading-relaxed italic max-w-2xl group-hover:text-white/40 transition-colors">
                     {task.description}
                   </p>
                )}
              </div>

              {/* Advanced Actions Hub */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-4 group-hover:translate-x-0">
                <Button 
                  onClick={() => setIsEditModalOpen(true)}
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5"
                >
                  <Edit2 className="w-4 h-4 text-white/40 group-hover:text-white transition-all" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5">
                      <MoreVertical className="w-4 h-4 text-white/40" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-3xl border-white/[0.05] bg-[#0a0a0a]/90 backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                    <DropdownMenuItem className="rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] gap-4 py-4 text-white/40 hover:text-white hover:bg-white/5 transition-all">
                       <CornerUpRight className="w-4 h-4" /> Forward Task
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteTask.mutate(task.id)}
                      className="rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] gap-4 py-4 text-rose-500/80 focus:text-rose-500 focus:bg-rose-500/5 transition-all"
                    >
                      <Trash2 className="w-4 h-4" /> Purge Sequence
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-8">
              <div className={cn(
                  "text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2.5 rounded-xl border inner-glow transition-all duration-700 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.02)]",
                  priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium
                )}
              >
                {task.priority} Focus
              </div>

              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[9px] font-black uppercase tracking-[0.3em] transition-all",
                  isOverdue ? "text-rose-500 animate-pulse" : "text-white/20 group-hover:text-white/40"
                )}>
                  {isOverdue ? <Zap className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {format(new Date(task.dueDate), 'MMM d, p')}
                </div>
              )}

              {/* Invisible touch for elite feel */}
              <div className="ml-auto flex items-center gap-4 text-white/[0.03] group-hover:text-white/10 transition-colors">
                <Target className="w-4 h-4" />
                <div className="w-[1px] h-3 bg-current" />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Node ID: {task.id.toString(16).padStart(4, '0')}</span>
              </div>
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
