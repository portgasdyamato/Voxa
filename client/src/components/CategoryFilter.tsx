import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Box, Target, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryFilterProps {
  selectedCategory: number | null;
  onCategoryChange: (id: number | null) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="space-y-3 px-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-11 w-full rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5 px-1">
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300 group relative overflow-hidden",
          selectedCategory === null 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:bg-muted/50"
        )}
      >
        <div className="flex items-center gap-3 relative z-10">
          <Box className={cn("w-4 h-4 transition-all", selectedCategory === null ? "scale-110" : "opacity-40 group-hover:opacity-100")} />
          <span>All Tasks</span>
        </div>
      </button>
      
      {categories?.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300 group relative overflow-hidden",
            selectedCategory === category.id 
              ? "bg-muted text-foreground border border-border shadow-sm" 
              : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          <div className="flex items-center gap-3 relative z-10">
            <div 
              className="w-2.5 h-2.5 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-125 border border-white/10" 
              style={{ backgroundColor: category.color }} 
            />
            <span>{category.name}</span>
          </div>
          {selectedCategory === category.id && (
            <motion.div 
              layoutId="categoryActive" 
              className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
            />
          )}
        </button>
      ))}
    </div>
  );
}
