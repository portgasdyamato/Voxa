import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Tag, Settings, Save, Trash2, Palette, Check, LayoutGrid, Terminal } from 'lucide-react';
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
      toast({ title: "Sector Integrated" });
    } catch (e) {
      toast({ title: "Integration Failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast({ title: "Sector Purged" });
    } catch (e) {
      toast({ title: "Security Halt", description: "Failed to purge sector registry.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-primary hover:bg-primary/5 gap-4 border border-white/[0.05] group transition-all duration-700">
          <LayoutGrid className="w-4 h-4 group-hover:rotate-90 transition-transform duration-700" />
          Modify Registry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[3rem] border border-white/[0.05] bg-[#050505] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh]">
        <DialogHeader className="p-16 pb-8 border-b border-white/[0.03] bg-[#0a0a0a] relative">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Terminal className="w-48 h-48 text-primary animate-pulse" />
          </div>
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl inner-glow">
               <Palette className="w-8 h-8 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black tracking-[-0.05em] text-white">Sector Registry</DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mt-1 italic">
                Defining intentional workspace nodes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-16 space-y-12 overflow-y-auto custom-scrollbar flex-1 pb-32">
          <div className="space-y-6">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 px-2 italic">New Node Core</p>
             <div className="flex gap-4">
               <Input 
                 value={newCatName}
                 onChange={(e) => setNewCatName(e.target.value)}
                 placeholder="ID key..."
                 className="h-16 rounded-2xl bg-white/[0.03] border-white/[0.05] px-8 text-sm font-bold placeholder:text-white/5 focus:bg-white/[0.06] transition-all"
               />
               <Button onClick={handleCreate} disabled={!newCatName.trim()} className="h-16 w-16 rounded-2xl bg-primary shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                 <Plus className="w-6 h-6 stroke-[3px]" />
               </Button>
             </div>
             
             <div className="flex flex-wrap gap-3 pt-6 px-2 justify-center">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewCatColor(color)}
                    className={cn(
                      "w-10 h-10 rounded-xl transition-all duration-500 border-2 overflow-hidden relative",
                      newCatColor === color ? "border-primary scale-125 shadow-2xl shadow-primary/40 rotate-12" : "border-white/[0.05] opacity-20 hover:opacity-100 hover:rotate-6"
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {newCatColor === color && <div className="absolute inset-0 bg-white/20" />}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-6 pt-10 border-t border-white/[0.03]">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 px-2 italic">Active Protocols</p>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {categories?.map((cat) => (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="flex items-center justify-between p-6 rounded-[2rem] border border-white/[0.03] bg-white/[0.02] group hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-700"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-3.5 h-3.5 rounded-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: cat.color }} />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white italic">{cat.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(cat.id)}
                      className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 transition-all duration-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="p-16 border-t border-white/[0.03] bg-[#0a0a0a] text-center shrink-0">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] italic border border-white/[0.05] text-white/20 hover:text-white"
          >
            Finalize Array
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
