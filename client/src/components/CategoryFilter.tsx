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
      <div className="space-y-2 px-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 w-full rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 px-1">
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          "w-full flex items-center justify-between px-6 h-12 rounded-2xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
          selectedCategory === null 
            ? "bg-white/[0.1] text-white border border-white/[0.15] shadow-lg" 
            : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
        )}
      >
        <div className="flex items-center gap-4 relative z-10 !normal-case !font-medium tracking-normal text-sm">
          <Layers className={cn("w-4 h-4 transition-colors", selectedCategory === null ? "text-blue-400" : "opacity-40 group-hover:opacity-100")} />
          <span className="!normal-case !font-medium">All Sectors</span>
        </div>
        {selectedCategory === null && (
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />
        )}
      </button>
      
      {categories?.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "w-full flex items-center justify-between px-6 h-12 rounded-2xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
            selectedCategory === category.id 
              ? "bg-white/[0.1] text-white border border-white/[0.15] shadow-lg" 
              : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
          )}
        >
          <div className="flex items-center gap-4 relative z-10 !normal-case !font-medium tracking-normal text-sm">
            <div 
              className="w-2.5 h-2.5 rounded-full border border-white/10 transition-transform duration-300 group-hover:scale-125" 
              style={{ backgroundColor: category.color }} 
            />
            <span className="!normal-case !font-medium">{category.name}</span>
          </div>
          {selectedCategory === category.id && (
             <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />
          )}
        </button>
      ))}
    </div>
  );
}
