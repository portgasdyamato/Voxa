import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpdateTask } from '@/hooks/useTasks';
import { Bell, CheckCircle2, X, Sparkles } from 'lucide-react';

const ALARM_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

interface AlarmData {
  task: any;
  title: string;
  body: string;
  isEvent?: boolean;
}

export function AlarmModal() {
  const [alarmData, setAlarmData] = useState<AlarmData | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const updateTask = useUpdateTask();

  useEffect(() => {
    const handleAlarm = (e: CustomEvent) => {
      const data = e.detail as AlarmData;
      setAlarmData(data);
      
      // Play audio in a loop
      const alarmSoundEnabled = localStorage.getItem('voxa_alarm_sound') !== 'false';
      if (alarmSoundEnabled) {
        if (!audioRef.current) {
          audioRef.current = new Audio(ALARM_SOUND_URL);
          audioRef.current.loop = true;
          audioRef.current.volume = 0.4; // Softer volume
        }
        audioRef.current.play().catch(e => {
          console.warn("Audio play blocked by browser (requires user interaction first)", e);
        });
      }
    };

    window.addEventListener('voxa-alarm-trigger', handleAlarm as EventListener);
    return () => {
      window.removeEventListener('voxa-alarm-trigger', handleAlarm as EventListener);
    };
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleCancel = () => {
    stopAudio();
    setAlarmData(null);
  };

  const handleDone = async () => {
    stopAudio();
    
    // If it's a calendar event, we just acknowledge and dismiss it (no 'completed' state)
    if (alarmData?.isEvent) {
      setAlarmData(null);
      return;
    }

    if (!alarmData?.task?.id) {
      setAlarmData(null);
      return;
    }
    
    try {
      await updateTask.mutateAsync({
        id: alarmData.task.id,
        updates: { completed: true }
      });
    } catch (e) {
      console.error("Failed to complete task:", e);
    }
    setAlarmData(null);
  };

  return (
    <AnimatePresence>
      {alarmData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={handleCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative w-full max-w-md bg-[#09090b] border border-white/[0.08] rounded-[2.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center text-center group"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.06] rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/[0.06] rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            
            {/* Subtle top edge highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />

            {/* Floating Soft Icon */}
            <div className="relative mb-8">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-blue-500/20 rounded-full blur-[30px]"
              />
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] flex items-center justify-center backdrop-blur-xl shadow-2xl shadow-blue-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-400/[0.1] to-transparent rounded-2xl pointer-events-none" />
                <Bell className="w-8 h-8 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
              </motion.div>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-white mb-3">
              {alarmData.title.replace(/⏰ |📅 |🌅 |🔔 /g, '')}
            </h2>
            <p className="text-sm font-medium text-white/50 mb-10 tracking-wide max-w-[80%] leading-relaxed">
              {alarmData.body}
            </p>

            <div className="flex flex-col w-full gap-3 relative z-10">
              {/* Primary Action Button (Dismiss) */}
              <button
                onClick={handleCancel}
                className="group/btn relative w-full h-14 bg-white/[0.03] hover:bg-white/[0.08] text-white rounded-2xl text-sm font-medium border border-white/[0.05] transition-all overflow-hidden flex items-center justify-center gap-3"
              >
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <span className="relative z-10 tracking-wide">Dismiss Reminder</span>
              </button>

              {/* Secondary Action Button (Done) */}
              {!alarmData.isEvent && (
                <button
                  onClick={handleDone}
                  className="group/done relative w-full h-12 text-white/40 hover:text-white/80 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="tracking-widest uppercase">Mark as Completed</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
