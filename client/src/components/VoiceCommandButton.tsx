import { useState, useEffect } from 'react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { VoiceCommandsHelp } from '@/components/VoiceCommandsHelp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, MessageSquare, Keyboard, Sparkles, X } from 'lucide-react';
import { Task } from '@/types/task';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceCommandButtonProps {
  tasks: Task[];
  className?: string;
}

export function VoiceCommandButton({ tasks, className }: VoiceCommandButtonProps) {
  const {
    isListening,
    transcript,
    lastCommand,
    startListening,
    stopListening,
    isSupported
  } = useVoiceCommands(tasks);
  
  const [showLastCommand, setShowLastCommand] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        if (isSupported) {
          handleClick();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isListening, isSupported]);

  if (!isSupported) return null;

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setShowLastCommand(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative group">
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary/20 rounded-full blur-xl pointer-events-none"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1.2, 1.8, 1.2], opacity: [0.2, 0, 0.2] }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute inset-0 bg-primary/10 rounded-full blur-2xl pointer-events-none"
              />
            </>
          )}
        </AnimatePresence>

        <Button
          onClick={handleClick}
          size="lg"
          className={cn(
            "relative h-20 w-20 rounded-full transition-all duration-500 shadow-2xl z-10",
            isListening 
              ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/40" 
              : "bg-primary hover:bg-primary/90 shadow-primary/40 group-hover:scale-105",
            className
          )}
        >
          {isListening ? (
            <MicOff className="h-8 w-8 text-white" />
          ) : (
            <Mic className="h-8 w-8 text-white" />
          )}
        </Button>

        {!isListening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -bottom-1 -right-1 bg-background border-2 border-primary rounded-lg p-1 z-20 hidden sm:block shadow-lg"
          >
            <Keyboard className="w-3 h-3 text-primary" />
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isListening ? (
          <motion.div
            key="listening"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="px-6 py-2 rounded-full bg-primary/5 border border-primary/10 backdrop-blur-md">
              <p className="text-sm font-bold text-primary animate-pulse flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Listening to your command...
              </p>
            </div>
            {transcript && (
              <p className="text-muted-foreground text-sm font-medium italic max-w-xs text-center line-clamp-2">
                "{transcript}..."
              </p>
            )}
          </motion.div>
        ) : lastCommand ? (
          <motion.div
            key="command"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLastCommand(!showLastCommand)}
                className="rounded-xl bg-muted/50 text-xs font-bold gap-2 px-4 h-9 shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-primary" />
                {showLastCommand ? "Hide Details" : "Show Last Command"}
              </Button>
            </div>

            <AnimatePresence>
              {showLastCommand && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-full max-w-sm overflow-hidden"
                >
                  <div className="p-4 rounded-2xl bg-card/60 backdrop-blur-xl border-2 border-border/50 shadow-inner relative group">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setShowLastCommand(false)}
                      className="absolute top-2 right-2 h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action Type</span>
                        <Badge variant={lastCommand.action === 'unknown' ? 'destructive' : 'secondary'} className="rounded-lg h-5 font-bold">
                          {lastCommand.action.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Transcription</span>
                        <p className="text-sm font-bold text-foreground">"{lastCommand.command}"</p>
                      </div>
                      {lastCommand.taskName && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Extracted Target</span>
                          <p className="text-sm font-bold text-primary flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            {lastCommand.taskName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              Press space or Ctrl+K to speak
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-2">
        <VoiceCommandsHelp />
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
