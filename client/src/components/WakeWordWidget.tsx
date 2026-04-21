import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreateTask, useUpdateTask, useDeleteTask, useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { executeVoiceCommand } from '@/lib/voiceCommandExecutor';

export function WakeWordWidget() {
  const [isActive, setIsActive] = useState(false);
  const [interimText, setInterimText] = useState('Listening...');
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const { data: tasks } = useTasks();
  const { data: categories } = useCategories();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleExecute = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    
    // Simulate processing delay slightly for visual feedback
    setInterimText('Processing command...');
    
    setTimeout(async () => {
       await executeVoiceCommand(
         transcript,
         tasks || [],
         '', 
         null, 
         true, 
         'default',
         '09:00',
         createTask,
         updateTask,
         deleteTask,
         toast,
         () => {
           setIsActive(false);
           setInterimText('Listening...');
         },
         '', 
         categories || []
       );
    }, 600);
  }, [tasks, categories, createTask, updateTask, deleteTask, toast]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    let isProcessingCommand = false;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const currentSpeech = (final + interim).toLowerCase();

      // Detect wake word variations
      if (!isProcessingCommand && /voxa|vox|vauxhall|boxa/i.test(currentSpeech)) {
         setIsActive(true);
         isProcessingCommand = true;
      }

      if (isProcessingCommand) {
         // Find everything spoken after the wake word
         const match = currentSpeech.match(/(?:voxa|vox|vauxhall|boxa)\s+(.*)/i);
         let commandText = match ? match[1] : '';
         
         if (commandText) {
             setInterimText(commandText);
         } else {
             setInterimText('Listening for your command...');
         }

         // If the user stopped talking, execute it
         if (event.results[event.results.length - 1].isFinal && commandText.trim().length > 2) {
            handleExecute(commandText);
            isProcessingCommand = false;
         }
      }
    };

    recognition.onerror = (event: any) => {
       if (event.error === 'not-allowed') {
           console.error("Microphone access denied.");
       }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      // Restart the recognition to keep it alive acting as a background listener
      timeoutRef.current = setTimeout(() => {
         startListening();
      }, 500);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error("Web Speech API start error", e);
    }
  }, [handleExecute]);

  useEffect(() => {
    startListening();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (recognitionRef.current) {
         recognitionRef.current.onend = null;
         recognitionRef.current.abort();
      }
    };
  }, [startListening]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
           initial={{ y: -100, opacity: 0, scale: 0.9 }}
           animate={{ y: 0, opacity: 1, scale: 1 }}
           exit={{ y: -100, opacity: 0, scale: 0.9 }}
           transition={{ type: "spring", stiffness: 400, damping: 25 }}
           className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
        >
           <div className="flex items-center gap-4 bg-[#0a0a0c]/98 backdrop-blur-[60px] border border-white/[0.15] shadow-[0_40px_100px_rgba(0,0,0,0.8),0_0_40px_rgba(59,130,246,0.15)] px-5 py-3.5 rounded-[2rem] min-w-[320px] max-w-[90vw] pointer-events-auto overflow-hidden relative group">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
              <div className="w-11 h-11 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-inner relative z-10">
                 <motion.div 
                   animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }} 
                   transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                 >
                   <Activity className="w-5 h-5 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                 </motion.div>
              </div>
              <div className="flex flex-col justify-center flex-1 min-w-0 relative z-10 pt-0.5">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/80 mb-1">
                   VoXa Background Agent
                 </span>
                 <p className="text-[15px] font-semibold text-white truncate tracking-tight">
                   {interimText}
                 </p>
              </div>
              <button 
                onClick={() => setIsActive(false)}
                className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 ml-2 pointer-events-auto shrink-0 relative z-10"
              >
                 <X className="w-4 h-4" />
              </button>
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
