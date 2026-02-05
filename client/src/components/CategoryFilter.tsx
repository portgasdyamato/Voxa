import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
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
    <div className="flex flex-col gap-1">
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
          selectedCategory === null 
            ? "bg-primary/10 text-primary" 
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <div className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
        All Contexts
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
            selectedCategory === category.id 
              ? "bg-primary/10 text-primary font-semibold" 
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: category.color }}
          />
          {category.name}
        </button>
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
    <div className="flex items-center gap-1.5">
      <div 
        className={cn("rounded-full", size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} 
        style={{ backgroundColor: category.color }}
      />
      <span className={cn(
        "font-medium text-muted-foreground",
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      )}>
        {category.name}
      </span>
    </div>
  );
}
