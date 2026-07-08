import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpdateTask } from '@/hooks/useTasks';
import { BellRing, CheckCircle2, X } from 'lucide-react';

const ALARM_SOUND_URL = 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';

interface AlarmData {
  task: any;
  title: string;
  body: string;
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
          audioRef.current.volume = 0.5;
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
    if (!alarmData?.task?.id) return;
    
    stopAudio();
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0c10] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center"
          >
            {/* Ringing Bell Icon */}
            <motion.div
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
            >
              <BellRing className="w-12 h-12 text-red-500" />
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-2">{alarmData.title}</h2>
            <p className="text-xl text-white/70 mb-10">{alarmData.body}</p>

            <div className="flex flex-col w-full gap-4">
              {/* Massive Cancel Button */}
              <button
                onClick={handleCancel}
                className="w-full py-6 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-2xl font-bold shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <X className="w-8 h-8" />
                Cancel Alarm
              </button>

              {/* Small Done Button */}
              <button
                onClick={handleDone}
                className="w-full py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white/80 rounded-xl text-sm font-medium border border-white/[0.05] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
