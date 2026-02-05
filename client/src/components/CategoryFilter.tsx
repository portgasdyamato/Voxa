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
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCategoryChange(null)}
          className={cn(
            "h-10 px-4 rounded-xl font-bold transition-all border-2",
            selectedCategory === null 
              ? "bg-primary/10 text-primary border-primary/20 shadow-sm" 
              : "border-transparent text-muted-foreground hover:bg-muted/50"
          )}
        >
          All Units
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "h-10 px-4 rounded-xl font-bold transition-all border-2",
              selectedCategory === category.id 
                ? "shadow-sm border-opacity-40" 
                : "border-transparent text-muted-foreground hover:bg-muted/50"
            )}
            style={selectedCategory === category.id ? { 
              backgroundColor: `${category.color}15`,
              color: category.color,
              borderColor: `${category.color}30`
            } : {}}
          >
            <div
              className="w-2.5 h-2.5 rounded-full mr-2 shadow-sm"
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
        "flex items-center gap-1.5 border-none font-bold uppercase tracking-tight",
        size === "sm" ? "text-[10px] px-2 py-0.5 rounded-lg" : "px-3 py-1 rounded-xl"
      )}
      style={{
        backgroundColor: `${category.color}15`,
        color: category.color,
      }}
    >
      <div
        className={cn("rounded-full", size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2")}
        style={{ backgroundColor: category.color }}
      />
      {category.name}
    </Badge>
  );
}
