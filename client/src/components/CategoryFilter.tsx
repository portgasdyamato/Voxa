import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Box, Target, Zap, Clock, ShieldHalf, Layers } from 'lucide-react';
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
      <div className="space-y-4 px-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 w-full rounded-2xl bg-white/[0.02] animate-pulse border border-white/[0.05]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 px-1">
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          "w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-700 group relative overflow-hidden",
          selectedCategory === null 
            ? "bg-primary text-white shadow-2xl shadow-primary/20" 
            : "text-white/20 hover:text-white hover:bg-white/[0.03]"
        )}
      >
        <div className="flex items-center gap-4 relative z-10">
          <Layers className={cn("w-4 h-4 transition-all duration-700", selectedCategory === null ? "scale-110" : "opacity-30 group-hover:opacity-100")} />
          <span className="italic">All Sectors</span>
        </div>
        {selectedCategory === null && (
          <motion.div layoutId="cat-glow" className="absolute inset-0 bg-white/10 blur-xl translate-y-12" />
        )}
      </button>
      
      {categories?.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-700 group relative overflow-hidden",
            selectedCategory === category.id 
              ? "bg-white/[0.08] text-white border border-white/[0.1] shadow-3xl" 
              : "text-white/20 hover:text-white hover:bg-white/[0.03]"
          )}
        >
          <div className="flex items-center gap-4 relative z-10">
            <div 
              className="w-2.5 h-2.5 rounded-full shadow-[0_0_15px_currentColor] transition-transform duration-700 group-hover:scale-125 group-hover:rotate-90 border border-white/20" 
              style={{ backgroundColor: category.color }} 
            />
            <span className="italic">{category.name}</span>
          </div>
          {selectedCategory === category.id && (
            <motion.div 
              layoutId="sectorActive" 
              className="w-1 h-3 rounded-full bg-white shadow-[0_0_10px_white]" 
            />
          )}
        </button>
      ))}
    </div>
  );
}
