import { useState } from 'react';
import { Task } from '@/types/task';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trash2, Edit2, Clock, Check, MoreVertical, Star, AlertCircle, Share2, Copy } from 'lucide-react';
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
import { CategoryBadge } from '@/components/CategoryFilter';
import { Confetti } from '@/components/Confetti';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: categories } = useCategories();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const category = categories?.find(c => c.id === task.categoryId);

  const handleToggleComplete = () => {
    const newCompleted = !task.completed;
    updateTask.mutate({ 
      id: task.id, 
      updates: { completed: newCompleted } 
    }, {
      onSuccess: () => {
        if (newCompleted) {
          setShowConfetti(true);
          toast({
            title: "Task Completed! 🎉",
            description: `Great job finishing "${task.title}"!`,
          });
        }
      }
    });
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id);
  };

  const priorityStyles = {
    high: 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_-3px_rgba(244,63,94,0.2)]',
    medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    low: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <motion.div
      layout
      className="group relative"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {showConfetti && <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />}
      <Card
        className={cn(
          "premium-card border-2",
          task.completed ? "opacity-60 grayscale-[0.3]" : "hover:border-primary/40",
          isOverdue ? "border-rose-500/30 bg-rose-500/[0.02]" : "border-border/60"
        )}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/5 to-accent-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="p-6 relative z-10">
          <div className="flex items-start gap-6">
            <div className="relative flex items-center justify-center mt-1.5 shrink-0">
               <motion.div
                 whileTap={{ scale: 0.8 }}
                 className="relative"
               >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={handleToggleComplete}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-all duration-300",
                    task.completed 
                      ? "bg-primary border-primary shadow-lg shadow-primary/20" 
                      : "border-muted-foreground/30 hover:border-primary"
                  )}
                />
                <AnimatePresence>
                  {task.completed && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="flex-1 space-y-4 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className={cn(
                      "text-xl font-bold transition-all duration-300 truncate tracking-tight",
                      task.completed ? "line-through text-muted-foreground/70" : "text-foreground"
                    )}>
                      {task.title}
                    </h3>
                    {task.priority === 'high' && !task.completed && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Star className="w-4 h-4 fill-rose-500 text-rose-500" />
                      </motion.div>
                    )}
                  </div>
                  {task.description && (
                    <p className={cn(
                      "text-sm font-medium leading-relaxed line-clamp-2 transition-all duration-300",
                      task.completed ? "text-muted-foreground/60" : "text-muted-foreground/80"
                    )}>
                      {task.description}
                    </p>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl shrink-0 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 ring-offset-background">
                      <MoreVertical className="w-4.5 h-4.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl border-2 p-1.5 shadow-2xl backdrop-blur-2xl bg-popover/90">
                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="rounded-xl gap-2.5 font-bold focus:bg-primary/10 focus:text-primary py-2.5">
                      <Edit2 className="w-4 h-4" /> Edit Parameters
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl gap-2.5 font-bold focus:bg-primary/10 py-2.5">
                      <Share2 className="w-4 h-4" /> Export Config
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="rounded-xl gap-2.5 font-bold text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 py-2.5">
                      <Trash2 className="w-4 h-4" /> Release Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {category && (
                  <CategoryBadge category={category} size="sm" />
                )}
                
                <Badge variant="outline" className={cn("rounded-lg border-2 px-3 py-0.5 font-black uppercase text-[9px] tracking-[0.1em]", priorityStyles[task.priority])}>
                  {task.priority}
                </Badge>

                {task.dueDate && (
                  <div className={cn(
                    "flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-xl bg-muted/40 border border-transparent transition-all",
                    isOverdue ? "text-rose-500 bg-rose-500/5 border-rose-500/20" : "text-muted-foreground group-hover:border-border/80 group-hover:bg-muted/60"
                  )}>
                    {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                    {format(new Date(task.dueDate), 'MMM d, h:mm a')}
                  </div>
                )}

                {task.isRecurring && (
                  <div className="flex items-center gap-2 text-xs font-bold text-primary/80 bg-primary/5 px-3 py-1 rounded-xl border border-primary/10">
                    <Clock className="w-3.5 h-3.5" />
                    {task.recurringPattern}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Priority accent side glow */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5",
          task.priority === 'high' ? "bg-rose-500 shadow-[2px_0_10px_rgba(244,63,94,0.4)]" : 
          task.priority === 'medium' ? "bg-amber-500 shadow-[2px_0_10px_rgba(245,158,11,0.2)]" : 
          "bg-emerald-500 shadow-[2px_0_10px_rgba(16,185,129,0.2)]",
          task.completed && "opacity-20"
        )} />
      </Card>

      <ManualTaskModal
        task={task}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </motion.div>
  );
}
