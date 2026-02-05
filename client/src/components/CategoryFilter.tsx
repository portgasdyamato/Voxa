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
    <div className="flex flex-wrap gap-2.5 items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onCategoryChange(null)}
        className={cn(
          "h-9 px-4 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all border",
          selectedCategory === null 
            ? "bg-foreground text-background border-foreground shadow-md" 
            : "border-border/30 text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
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
            "h-9 px-4 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all border",
            selectedCategory === category.id 
              ? "shadow-md border-opacity-50" 
              : "border-border/20 text-muted-foreground/50 hover:bg-muted/30"
          )}
          style={selectedCategory === category.id ? { 
            backgroundColor: `${category.color}15`,
            color: category.color,
            borderColor: `${category.color}30`,
          } : {}}
        >
          <div
            className="w-1.5 h-1.5 rounded-full mr-2 shrink-0"
            style={{ backgroundColor: category.color }}
          />
          {category.name}
        </Button>
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
    <Badge
      variant="secondary"
      className={cn(
        "flex items-center gap-2 border font-bold uppercase tracking-wider leading-none",
        size === "sm" ? "text-[9px] px-2 py-0.5 rounded-md" : "px-3 py-1 rounded-lg"
      )}
      style={{
        backgroundColor: `${category.color}10`,
        color: category.color,
        borderColor: `${category.color}20`,
      }}
    >
      <div
        className={cn("rounded-full shrink-0", size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5")}
        style={{ backgroundColor: category.color }}
      />
      {category.name}
    </Badge>
  );
}
