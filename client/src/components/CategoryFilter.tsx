import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { Filter, X, Tag } from "lucide-react";
import type { Category } from "@shared/schema";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCategoryChange(null)}
          className={cn(
            "h-11 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all border-2",
            selectedCategory === null 
              ? "bg-foreground text-background border-foreground shadow-xl" 
              : "border-border/40 text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
          )}
        >
          All Contexts
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "h-11 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all border-2",
              selectedCategory === category.id 
                ? "shadow-xl border-opacity-60" 
                : "border-border/30 text-muted-foreground/60 hover:bg-muted/30"
            )}
            style={selectedCategory === category.id ? { 
              backgroundColor: `${category.color}15`,
              color: category.color,
              borderColor: `${category.color}40`,
              boxShadow: `0 10px 15px -3px ${category.color}20`
            } : {}}
          >
            <div
              className="w-2 h-2 rounded-full mr-3 shadow-sm shrink-0"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </Button>
        ))}
      </div>
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
    <Badge
      variant="secondary"
      className={cn(
        "flex items-center gap-2 border-2 font-black uppercase tracking-widest leading-none",
        size === "sm" ? "text-[8px] px-2.5 py-1 rounded-lg" : "px-4 py-1.5 rounded-xl"
      )}
      style={{
        backgroundColor: `${category.color}10`,
        color: category.color,
        borderColor: `${category.color}20`,
      }}
    >
      <div
        className={cn("rounded-full shrink-0", size === "sm" ? "w-1.5 h-1.5" : "w-2.5 h-2.5")}
        style={{ backgroundColor: category.color }}
      />
      {category.name}
    </Badge>
  );
}
