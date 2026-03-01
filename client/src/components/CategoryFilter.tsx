import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Layers, Box, Globe, Shield, Target } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const { data: categoriesData } = useCategories();
  
  const categories = categoriesData ? categoriesData.filter((category, index, self) => 
    index === self.findIndex(c => c.name === category.name)
  ) : [];
  
  if (!categories || categories.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-col gap-3 py-2">
      <motion.button
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onCategoryChange(null)}
        className={cn(
          "flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all text-left italic relative overflow-hidden group",
          selectedCategory === null 
            ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
            : "text-muted-foreground/40 hover:text-white hover:bg-white/5 border border-transparent"
        )}
      >
        <div className={cn(
          "w-5 h-5 flex items-center justify-center transition-all duration-500",
          selectedCategory === null ? "text-primary scale-110" : "text-muted-foreground/30 group-hover:text-white/60"
        )}>
          <Globe className="w-4 h-4" />
        </div>
        <span className="relative z-10">All Sectors</span>
        {selectedCategory === null && (
          <motion.div 
            layoutId="activeFilter"
            className="absolute left-0 w-1 h-6 bg-primary rounded-full"
          />
        )}
      </motion.button>
      
      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all text-left italic relative overflow-hidden group",
            selectedCategory === category.id 
              ? "bg-white/5 text-white border border-white/10 shadow-xl" 
              : "text-muted-foreground/40 hover:text-white hover:bg-white/5 border border-transparent"
          )}
        >
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:scale-125"
            style={{ 
              backgroundColor: category.color,
              filter: selectedCategory === category.id ? `drop-shadow(0 0 5px ${category.color})` : 'none'
            }}
          />
          <span className="relative z-10 truncate">{category.name}</span>
          {selectedCategory === category.id && (
            <motion.div 
              layoutId="activeFilter"
              className="absolute left-0 w-1 h-6 bg-white rounded-full shadow-[0_0_10px_white]"
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}

interface CategoryBadgeProps {
  category: any;
  size?: "sm" | "default";
}

export function CategoryBadge({ category, size = "default" }: CategoryBadgeProps) {
  if (!category) return null;
  
  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-1 rounded-full border border-white/5 bg-white/[0.03] backdrop-blur-sm",
      size === 'sm' ? 'px-1.5 gap-1.5' : 'px-2.5 gap-2'
    )}>
      <div 
        className={cn("rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)]", size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} 
        style={{ backgroundColor: category.color }}
      />
      <span className={cn(
        "font-black uppercase tracking-widest text-muted-foreground/80 italic",
        size === 'sm' ? 'text-[8px]' : 'text-[10px]'
      )}>
        {category.name}
      </span>
    </div>
  );
}
