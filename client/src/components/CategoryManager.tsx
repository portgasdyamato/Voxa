import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Palette, Sparkles, X, Check } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-8 p-10">
      <div className="space-y-3">
        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Context Designation</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Critical Logistics"
          className="h-14 rounded-2xl border-2 bg-muted/30 font-black text-lg focus-visible:border-primary transition-all px-6"
          required
        />
      </div>
      
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Visual Signature</Label>
        <div className="grid grid-cols-5 gap-4 p-6 rounded-[2rem] bg-muted/20 border-2 border-border/40">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              className={cn(
                "w-full aspect-square rounded-xl transition-all relative group",
                color === presetColor ? "scale-110 shadow-xl" : "opacity-40 hover:opacity-100 hover:scale-110"
              )}
              style={{ backgroundColor: presetColor }}
              onClick={() => setColor(presetColor)}
            >
               {color === presetColor && (
                 <motion.div 
                   layoutId="activeColor"
                   className="absolute inset-0 border-4 border-white/40 rounded-xl flex items-center justify-center"
                 >
                   <Check className="w-4 h-4 text-white" />
                 </motion.div>
               )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex gap-4 pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary text-white shadow-2xl shadow-primary/30 active:scale-95 transition-all"
        >
          {category ? "Commit Parameters" : "Initialize Context"}
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onClose}
          className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs px-8"
        >
          Abort
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
    if (window.confirm(`Release category "${category.name}"? This action is irreversible.`)) {
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex items-center justify-between p-5 rounded-3xl border-2 border-border/40 bg-card/40 backdrop-blur-2xl hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl"
    >
      <div className="flex items-center gap-4">
        <div
          className="w-4 h-4 rounded-full shadow-2xl transition-transform group-hover:scale-125 border-4 border-white/10"
          style={{ backgroundColor: category.color }}
        />
        <span className="font-black text-sm uppercase tracking-wider">{category.name}</span>
      </div>
      
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all">
              <Edit2 className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[3rem] border-2 shadow-3xl backdrop-blur-3xl p-0 overflow-hidden">
            <DialogHeader className="p-10 pb-2">
              <DialogTitle className="text-3xl font-black tracking-tighter">Modify Parameter</DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Update context metadata</DialogDescription>
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
          className="h-10 w-10 rounded-xl hover:bg-rose-500/10 text-muted-foreground/40 hover:text-rose-500 border border-transparent hover:border-rose-500/20 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export function CategoryManager() {
  const [isCreating, setIsCreating] = useState(false);
  const { data: categories, isLoading } = useCategories();
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
            <Palette className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] leading-none mb-1">Context Entities</h4>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Global taxonomy</p>
          </div>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-2xl bg-foreground text-background shadow-2xl hover:bg-primary hover:text-white transition-all active:scale-90">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[3rem] border-2 shadow-3xl backdrop-blur-3xl p-0 overflow-hidden">
            <DialogHeader className="p-10 pb-2">
              <DialogTitle className="text-3xl font-black tracking-tighter">Initialize Context</DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Create new taxonomy unit</DialogDescription>
            </DialogHeader>
            <CategoryForm onClose={() => setIsCreating(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 rounded-[2.5rem] bg-muted/30 animate-pulse border-2 border-border/30" />)}
          </div>
        ) : categories?.length === 0 ? (
          <div className="text-center py-20 px-8 rounded-[3rem] bg-muted/10 border-2 border-dashed border-border/40">
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
              <Palette className="w-10 h-10" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">No context protocols defined.</p>
          </div>
        ) : (
          <div className="space-y-4">
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
