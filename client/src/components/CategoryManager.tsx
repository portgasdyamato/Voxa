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
        <button className="w-full flex items-center justify-center gap-3 h-11 px-6 rounded-2xl text-xs font-medium text-white/30 hover:text-white/60 bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
          <Palette className="w-3.5 h-3.5" />
          Edit Sectors
        </button>
      </DialogTrigger>
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-md w-[calc(100%-2rem)] p-0 overflow-hidden rounded-[2.5rem] border border-white/[0.22] bg-[#080809] backdrop-blur-[60px] shadow-[0_60px_120px_rgba(0,0,0,0.98)] flex flex-col max-h-[85vh] transition-all no-scrollbar">
        {/* Bevel Top Highlight */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent z-50 pointer-events-none" />
        {/* Subtle glass overlay */}
        <div className="absolute inset-0 bg-white/[0.03] pointer-events-none" />

        {/* Header */}
        <DialogHeader className="px-8 pt-10 pb-6 border-b border-white/[0.06] flex-shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
               <Palette className="w-5 h-5 text-blue-400" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-xl font-semibold text-white tracking-tight">Manage Categories</DialogTitle>
              <DialogDescription className="text-sm text-white/30 font-light">
                Organize your workflow by sector
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 py-8 space-y-8 overflow-y-auto flex-1 relative z-10 no-scrollbar">
          {/* New Category */}
          <div className="space-y-4">
             <Label className="text-xs font-medium text-white/40 pl-1">New Sector</Label>
             <div className="flex gap-3">
                <Input 
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter') handleCreate();
                  }}
                  placeholder="e.g. Finance"
                  className="h-11 rounded-2xl border-white/[0.1] bg-white/[0.04] text-sm font-medium px-5 placeholder:text-white/20 focus-visible:ring-white/10 transition-all"
                />
               <Button onClick={handleCreate} disabled={!newCatName.trim() || createCategory.isPending} className="h-11 w-11 p-0 rounded-2xl bg-white text-black hover:bg-neutral-200 shadow-xl flex-shrink-0">
                 <Plus className="w-5 h-5" />
               </Button>
             </div>
             
             <div className="flex gap-2.5 pt-1 px-1">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewCatColor(color)}
                    className={cn(
                      "w-6 h-6 rounded-full transition-transform border-2",
                      newCatColor === color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100 hover:scale-110"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
             </div>
          </div>

          {/* Category List */}
          <div className="space-y-4 pt-4 border-t border-white/[0.06]">
            <Label className="text-xs font-medium text-white/40 pl-1">Active Sectors</Label>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {categories?.map((cat) => (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.05] bg-white/[0.02] group"
                  >
                    <div className="flex items-center gap-3.5 pl-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-medium text-white/80">{cat.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(cat.id)}
                      className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/[0.06] flex-shrink-0 relative z-10">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="w-full h-11 rounded-full text-sm font-medium text-white/40 hover:text-white transition-colors"
          >
            Finished
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={cn("block", className)}>{children}</label>;
}
