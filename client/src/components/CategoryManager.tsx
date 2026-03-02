import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Tag, Settings, Save, Trash2, Palette, Check, LayoutGrid } from 'lucide-react';
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
      toast({ title: "Category deleted" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full h-11 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted gap-3 border border-border transition-all">
          <LayoutGrid className="w-4 h-4" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_40px_80px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.8)] flex flex-col translate-y-[-50%]">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
               <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground tracking-tight">Categories</DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground/60 font-medium mt-0.5">
                Create and manage your task categories
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* New Category */}
          <div className="space-y-4">
             <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">New Category</Label>
             <div className="flex gap-3">
                <Input 
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter') handleCreate();
                  }}
                  placeholder="Category name"
                  className="h-11 rounded-xl bg-muted/50 border-border text-sm font-semibold placeholder:text-muted-foreground/40 focus-visible:ring-primary/40"
                />
               <Button onClick={handleCreate} disabled={!newCatName.trim() || createCategory.isPending} className="h-11 w-11 p-0 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30 flex-shrink-0">
                 <Plus className="w-5 h-5" />
               </Button>
             </div>
             
             <div className="flex gap-2 pt-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewCatColor(color)}
                    className={cn(
                      "w-7 h-7 rounded-full transition-transform border-2",
                      newCatColor === color ? "border-white scale-110 shadow-md" : "border-transparent opacity-50 hover:opacity-100 hover:scale-110"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
             </div>
          </div>

          {/* Category List */}
          <div className="space-y-4 pt-4 border-t border-border">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">Existing Categories</Label>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {categories?.map((cat) => (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 group"
                  >
                    <div className="flex items-center gap-3 pl-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(cat.id)}
                      className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {(!categories || categories.length === 0) && (
                <div className="text-center py-6 text-sm text-muted-foreground/40 font-medium border border-dashed border-border rounded-xl">
                  No categories yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/10 shrink-0">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="w-full h-11 rounded-xl font-bold text-sm border border-border text-foreground hover:bg-muted"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={cn("block", className)}>{children}</label>;
}
