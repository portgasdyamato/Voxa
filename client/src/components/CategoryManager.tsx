import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Tag, Settings, Save, Trash2, Palette, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function CategoryManager() {
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [editingId, setEditingId] = useState<number | null>(null);

  const colors = [
    '#3b82f6', '#f43f5e', '#10b981', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'
  ];

  const handleCreate = async () => {
    if (!newCatName.trim()) return;
    try {
      await createCategory.mutateAsync({ name: newCatName.trim(), color: newCatColor });
      setNewCatName('');
      toast({ title: "Category added" });
    } catch (e) {
      toast({ title: "Failed to add category", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast({ title: "Category removed" });
    } catch (e) {
      toast({ title: "Failed to remove category", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary hover:bg-primary/5 gap-3 border border-dashed border-border/50 group transition-all">
          <Plus className="w-4 h-4 group-hover:scale-110" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[2.5rem] bg-background border border-border shadow-2xl flex flex-col max-h-[85vh]">
        <DialogHeader className="p-10 pb-6 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
               <Palette className="w-7 h-7 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Category Manager</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground font-medium mt-0.5">
                Organize your tasks by category and color.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-4">
             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-1">New Category</p>
             <div className="flex gap-4">
               <Input 
                 value={newCatName}
                 onChange={(e) => setNewCatName(e.target.value)}
                 placeholder="Category name..."
                 className="h-12 rounded-xl bg-muted/30 border-border"
               />
               <Button onClick={handleCreate} disabled={!newCatName.trim()} className="h-12 px-6 rounded-xl bg-primary shadow-lg shadow-primary/10">
                 <Plus className="w-4 h-4" />
               </Button>
             </div>
             
             <div className="flex flex-wrap gap-2 pt-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewCatColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all border-2",
                      newCatColor === color ? "border-primary scale-110 shadow-lg shadow-primary/10" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {newCatColor === color && <Check className="w-4 h-4 text-white mx-auto stroke-[3px]" />}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-1">Existing Categories</p>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {categories?.map((cat) => (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20 group hover:bg-muted/40 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-bold uppercase tracking-widest leading-none">{cat.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(cat.id)}
                      className="h-9 w-9 rounded-lg opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="p-10 border-t border-border bg-muted/20 text-center shrink-0">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="w-full h-14 rounded-xl font-bold uppercase tracking-widest text-[10px] border border-border"
          >
            Finished
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
