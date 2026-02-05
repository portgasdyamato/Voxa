import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Palette, Check, Settings2 } from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import type { Category } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", 
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

interface CategoryFormProps {
  category?: Category;
  onClose: () => void;
}

function CategoryForm({ category, onClose }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || "");
  const [color, setColor] = useState(category?.color || "#3B82F6");
  
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, updates: { name: name.trim(), color } });
      } else {
        await createCategory.mutateAsync({ name: name.trim(), color });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };
  
  const isLoading = createCategory.isPending || updateCategory.isPending;
  
  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-0.5">Label</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Work, Personal, etc."
          className="h-10 rounded-xl border-border/50 bg-muted/20 font-medium"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-0.5">Brand Color</Label>
        <div className="grid grid-cols-5 gap-3 p-4 rounded-xl bg-muted/20 border border-border/50">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              className={cn(
                "w-full aspect-square rounded-lg transition-all relative flex items-center justify-center",
                color === presetColor ? "scale-105 shadow-md" : "opacity-40 hover:opacity-100"
              )}
              style={{ backgroundColor: presetColor }}
              onClick={() => setColor(presetColor)}
            >
               {color === presetColor && <Check className="w-3 h-3 text-white" />}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onClose}
          className="flex-1 rounded-xl h-10 font-bold"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex-1 rounded-xl h-10 font-bold"
        >
          {isLoading ? "Saving..." : (category ? "Save Changes" : "Create Context")}
        </Button>
      </div>
    </form>
  );
}

export function CategoryManager() {
  const [isCreating, setIsCreating] = useState(false);
  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Manage Contexts</h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <button className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground/60 hover:text-foreground">
              <Plus className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2 border-b border-border/10">
              <DialogTitle className="text-lg font-bold">New Context</DialogTitle>
              <DialogDescription className="text-sm">Create a custom category for your objectives.</DialogDescription>
            </DialogHeader>
            <CategoryForm onClose={() => setIsCreating(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-1">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1,2].map(i => <div key={i} className="h-10 rounded-xl bg-muted/30" />)}
          </div>
        ) : categories?.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/40 text-center py-4">No categories defined.</p>
        ) : (
          <div className="space-y-1">
            {categories?.map((category) => (
              <CategoryItem key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryItem({ category }: { category: Category }) {
  const [isEditing, setIsEditing] = useState(false);
  const deleteCategory = useDeleteCategory();
  
  return (
    <div className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
        <span className="text-sm font-medium text-foreground/80">{category.name}</span>
      </div>
      
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <button className="p-1.5 hover:bg-muted rounded-md text-muted-foreground/40 hover:text-foreground">
              <Edit2 className="w-3 h-3" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2 border-b border-border/10">
              <DialogTitle className="text-lg font-bold">Edit Context</DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={category}
              onClose={() => setIsEditing(false)}
            />
          </DialogContent>
        </Dialog>
        
        <button
          onClick={() => {
            if (confirm(`Delete "${category.name}"?`)) {
              deleteCategory.mutate(category.id);
            }
          }}
          className="p-1.5 hover:bg-muted rounded-md text-muted-foreground/40 hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
