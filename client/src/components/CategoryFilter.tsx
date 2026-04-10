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
      <div className="space-y-3 px-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 w-full rounded-[1.25rem] bg-white/[0.02] border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 px-1">
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          "w-full flex items-center justify-between px-8 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-700 group relative overflow-hidden",
          selectedCategory === null 
            ? "bg-white/[0.08] text-white border border-white/[0.22] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" 
            : "text-white/20 hover:text-white/60 hover:bg-white/[0.03]"
        )}
      >
        <div className="flex items-center gap-5 relative z-10 italic">
          <Layers className={cn("w-4 h-4 transition-all duration-700", selectedCategory === null ? "text-blue-400 scale-110" : "opacity-20 group-hover:opacity-100")} />
          <span>All Sectors</span>
        </div>
        {selectedCategory === null && (
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />
        )}
      </button>
      
      {categories?.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "w-full flex items-center justify-between px-8 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-700 group relative overflow-hidden",
            selectedCategory === category.id 
              ? "bg-white/[0.08] text-white border border-white/[0.22] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" 
              : "text-white/20 hover:text-white/60 hover:bg-white/[0.03]"
          )}
        >
          <div className="flex items-center gap-5 relative z-10 italic">
            <div 
              className="w-2.5 h-2.5 rounded-full shadow-[0_0_15px_currentColor] border border-white/20 transition-all duration-700" 
              style={{ 
                backgroundColor: category.color,
                boxShadow: selectedCategory === category.id ? `0 0 15px ${category.color}80` : 'none'
              }} 
            />
            <span>{category.name}</span>
          </div>
          {selectedCategory === category.id && (
             <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />
          )}
        </button>
      ))}
    </div>
  );
}
