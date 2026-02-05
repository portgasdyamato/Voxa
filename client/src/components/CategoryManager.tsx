import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Palette, Sparkles } from "lucide-react";
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
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, updates: { name, color } });
      } else {
        await createCategory.mutateAsync({ name, color });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };
  
  const isLoading = createCategory.isPending || updateCategory.isPending;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div className="space-y-3">
        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Label Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Strategic Operations"
          className="h-12 rounded-xl border-2 bg-muted/30 font-bold focus:border-primary transition-all"
          required
        />
      </div>
      
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visual Marker</Label>
        <div className="grid grid-cols-5 gap-3 p-4 rounded-2xl bg-muted/30 border-2">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              className={cn(
                "w-full aspect-square rounded-xl transition-all hover:scale-110",
                color === presetColor ? "ring-4 ring-primary ring-offset-2 ring-offset-background scale-110" : "opacity-60 hover:opacity-100"
              )}
              style={{ backgroundColor: presetColor }}
              onClick={() => setColor(presetColor)}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-12 p-1 rounded-xl cursor-not-allowed hidden"
          />
          <p className="text-[10px] font-bold text-muted-foreground italic">Neural color mapping enabled</p>
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
        >
          {category ? "Update System" : "Record Unit"}
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onClose}
          className="h-12 rounded-xl font-black uppercase tracking-widest text-xs"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface CategoryItemProps {
  category: Category;
}

function CategoryItem({ category }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const deleteCategory = useDeleteCategory();
  
  const handleDelete = async () => {
    if (window.confirm(`Release category "${category.name}"? Tasks will be detached.`)) {
      try {
        await deleteCategory.mutateAsync(category.id);
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };
  
  return (
    <motion.div
      layout
      className="group relative flex items-center justify-between p-4 rounded-2xl border-2 border-border/50 bg-card/60 backdrop-blur-xl hover:border-primary/20 transition-all"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full shadow-lg"
          style={{ backgroundColor: category.color }}
        />
        <span className="font-bold text-sm">{category.name}</span>
      </div>
      
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] border-2 shadow-2xl backdrop-blur-3xl p-0 overflow-hidden">
            <DialogHeader className="p-8 pb-0">
              <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Palette className="w-5 h-5" /> Modify Class
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={category}
              onClose={() => setIsEditing(false)}
            />
          </DialogContent>
        </Dialog>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground/60 hover:text-rose-500"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

export function CategoryManager() {
  const [isCreating, setIsCreating] = useState(false);
  const { data: categories, isLoading } = useCategories();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest leading-none">System Classes</h4>
            <p className="text-[10px] font-medium text-muted-foreground">Manage organizational entities</p>
          </div>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="icon" className="h-10 w-10 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] border-2 shadow-2xl backdrop-blur-3xl p-0 overflow-hidden">
            <DialogHeader className="p-8 pb-0">
              <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Initialize Unit
              </DialogTitle>
            </DialogHeader>
            <CategoryForm onClose={() => setIsCreating(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <div className="h-40 rounded-3xl bg-muted/30 animate-pulse border-2 border-dashed border-border" />
        ) : categories?.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-3xl bg-muted/20 border-2 border-dashed border-border">
            <Palette className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-sm font-bold text-muted-foreground/80">No classes defined.</p>
          </div>
        ) : (
          <div className="space-y-3">
             <AnimatePresence mode="popLayout">
               {categories?.map((category) => (
                 <CategoryItem key={category.id} category={category} />
               ))}
             </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
