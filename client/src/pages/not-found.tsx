import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Home, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-6 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-rose-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center space-y-12"
      >
        <div className="relative inline-block">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 border border-dashed border-primary/20 rounded-full" 
          />
          <div className="w-48 h-48 rounded-[3rem] bg-card border-2 border-border/40 shadow-3xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-8xl font-black tracking-tighter text-primary/20 absolute select-none">404</span>
            <AlertCircle className="w-20 h-20 text-primary relative z-10" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
            Protocol <span className="text-primary">Fracture</span>
          </h1>
          <p className="text-muted-foreground/60 font-bold uppercase tracking-widest text-sm max-w-sm mx-auto">
            The requested neural path could not be resolved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="h-16 px-10 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all">
              <Home className="w-4 h-4 mr-2" /> Return to Core
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="h-16 px-10 rounded-2xl border-2 font-black uppercase tracking-widest text-xs hover:bg-muted/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retrace Path
          </Button>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="fixed bottom-20 left-20 opacity-20 hidden lg:block"
      >
        <Zap className="w-12 h-12 text-primary fill-primary" />
      </motion.div>
    </div>
  );
}
