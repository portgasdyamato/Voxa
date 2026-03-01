import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Palette, Check, Settings2, Target, Zap, Shield, Cpu, Activity } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="p-10 space-y-10">
      <div className="space-y-4">
        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-2 italic">Sector Descriptor</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="IDENTIFY SECTOR..."
          className="h-14 rounded-2xl border-white/5 bg-white/5 font-black uppercase tracking-[0.2em] text-[11px] px-8 italic focus:border-primary/40 focus:bg-white/[0.08] transition-all"
          required
        />
      </div>
      
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-2 italic">Neural Palette</Label>
        <div className="grid grid-cols-5 gap-4 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-inner">
          {PRESET_COLORS.map((presetColor) => (
            <motion.button
              key={presetColor}
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "w-full aspect-square rounded-xl transition-all relative flex items-center justify-center border-2",
                color === presetColor ? "border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-110" : "border-transparent opacity-40 hover:opacity-100"
              )}
              style={{ backgroundColor: presetColor }}
              onClick={() => setColor(presetColor)}
            >
               {color === presetColor && (
                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                   <Check className="w-5 h-5 text-white shadow-sm" />
                 </motion.div>
               )}
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className="flex gap-4 pt-6">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onClose}
          className="flex-1 rounded-2xl h-16 font-black uppercase tracking-[0.3em] text-[10px] italic border border-white/5 hover:bg-white/5 transition-all"
        >
          Abort
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex-1 rounded-2xl h-16 font-black uppercase tracking-[0.3em] text-[10px] italic gradient-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {isLoading ? "SYNCING..." : (category ? "SYNCHRONIZE" : "INITIALIZE")}
        </Button>
      </div>
    </form>
  );
}

export function CategoryManager() {
  const [isCreating, setIsCreating] = useState(false);
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Cpu className="w-3.5 h-3.5 text-primary opacity-40" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Sector Registry</h3>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-white/5 rounded-xl transition-all text-primary/60 hover:text-primary border border-white/5"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl p-0 overflow-hidden noise-surface border-2 border-white/5 bg-slate-950/80 backdrop-blur-[50px] shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-[3.5rem] flex flex-col">
            <DialogHeader className="p-10 pb-6 border-b border-white/5 relative bg-white/[0.02]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-foreground/5 flex items-center justify-center border-2 border-white/10 shadow-2xl">
                   <Target className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black tracking-tighter text-gradient italic uppercase">Deploy Sector</DialogTitle>
                  <DialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 mt-1 italic">
                    Establish new contextual mission parameters
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <CategoryForm onClose={() => setIsCreating(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-white/[0.03] animate-pulse border border-white/5" />
            ))}
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="text-center py-10 px-6 rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
            <Activity className="w-8 h-8 text-white/5 mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic">No Sectors Identified</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {categories.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))}
            </AnimatePresence>
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
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="group flex items-center justify-between p-4 px-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all"
    >
      <div className="flex items-center gap-5">
        <div 
          className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] transition-all duration-500 group-hover:scale-125" 
          style={{ backgroundColor: category.color, color: category.color }} 
        />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-300 group-hover:text-white transition-colors italic">{category.name}</span>
      </div>
      
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <button className="p-2.5 hover:bg-white/5 rounded-xl text-muted-foreground/40 hover:text-primary transition-all">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl p-0 overflow-hidden noise-surface border-2 border-white/5 bg-slate-950/80 backdrop-blur-[50px] shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-[3.5rem] flex flex-col">
            <DialogHeader className="p-10 pb-6 border-b border-white/5 relative bg-white/[0.02]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-foreground/5 flex items-center justify-center border-2 border-white/10 shadow-2xl">
                   <Settings2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black tracking-tighter text-gradient italic uppercase">Reconfig Sector</DialogTitle>
                  <DialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 mt-1 italic">
                    Update intelligence parameters for this sector
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <CategoryForm
              category={category}
              onClose={() => setIsEditing(false)}
            />
          </DialogContent>
        </Dialog>
        
        <button
          onClick={() => {
            if (confirm(`INITIATE PURGE SEQUENCE FOR SECTOR: "${category.name.toUpperCase()}"?`)) {
              deleteCategory.mutate(category.id);
            }
          }}
          className="p-2.5 hover:bg-rose-500/10 rounded-xl text-muted-foreground/40 hover:text-rose-500 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
