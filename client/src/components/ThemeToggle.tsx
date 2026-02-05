import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl hover:bg-muted/50 transition-all relative overflow-hidden group">
          <AnimatePresence mode="wait">
             {theme === 'light' ? (
               <motion.div 
                 key="light"
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: -20, opacity: 0 }}
                 transition={{ duration: 0.2 }}
               >
                 <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-45 transition-transform" />
               </motion.div>
             ) : (
               <motion.div 
                 key="dark"
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: -20, opacity: 0 }}
                 transition={{ duration: 0.2 }}
               >
                 <Moon className="h-5 w-5 text-indigo-400 group-hover:-rotate-12 transition-transform" />
               </motion.div>
             )}
          </AnimatePresence>
          <span className="sr-only">Toggle illumination</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl border-2 p-1.5 shadow-2xl backdrop-blur-2xl">
        <DropdownMenuItem onClick={() => setTheme('light')} className="rounded-xl font-bold gap-3 py-2.5 focus:bg-amber-500/10 focus:text-amber-500 transition-colors">
          <Sun className="h-4 w-4" />
          <span>Light Mode</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="rounded-xl font-bold gap-3 py-2.5 focus:bg-indigo-500/10 focus:text-indigo-500 transition-colors">
          <Moon className="h-4 w-4" />
          <span>Dark Mode</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="rounded-xl font-bold gap-3 py-2.5 focus:bg-primary/10 transition-colors">
          <Monitor className="h-4 w-4" />
          <span>System Default</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
