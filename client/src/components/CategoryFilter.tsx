import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { Filter, X } from "lucide-react";
import type { Category } from "@shared/schema";

interface CategoryFilterProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const { data: categories } = useCategories();
  
  if (!categories || categories.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Filter className="w-4 h-4" />
        <span>Filter by:</span>
      </div>
      
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(null)}
        className="h-7"
      >
        All Tasks
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className="h-7 pl-2 pr-3"
        >
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: category.color }}
          />
          {category.name}
        </Button>
      ))}
      
      {selectedCategory !== null && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="h-7 px-2"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

interface CategoryBadgeProps {
  category: Category | null;
  size?: "sm" | "default";
}

export function CategoryBadge({ category, size = "default" }: CategoryBadgeProps) {
  if (!category) return null;
  
  return (
    <Badge
      variant="secondary"
      className={`flex items-center gap-1.5 ${
        size === "sm" ? "text-xs px-1.5 py-0.5" : ""
      }`}
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
        borderColor: `${category.color}40`,
      }}
    >
      <div
        className={`rounded-full ${size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5"}`}
        style={{ backgroundColor: category.color }}
      />
      {category.name}
    </Badge>
  );
}
