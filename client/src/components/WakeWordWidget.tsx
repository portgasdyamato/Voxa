import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X, Mic, MicOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreateTask, useUpdateTask, useDeleteTask, useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { executeVoiceCommand } from '@/lib/voiceCommandExecutor';

// ─── Types ─────────────────────────────────────────────────────────────────────
type PermissionState = 'unknown' | 'requesting' | 'granted' | 'denied';
type ListenerState  = 'idle' | 'listening' | 'awake' | 'processing';

// ─── Wake-word phonetic variants ───────────────────────────────────────────────
// The browser dictation engine frequently misrenders non-dictionary words.
// This list covers what Chrome/Safari actually transcribes when someone says "VoXa".
const WAKE_PATTERNS = [
  'voxa', 'vox a', 'vox', 'boxa', 'box a',
  'foxy', 'fox a', 'vodka', 'volta', 'vulva',
  'vosa', 'boca', 'folk', 'yoga', 'yoko',
  'walker', 'walkers', 'boxer',
  'hey assistant', 'hey computer', 'hey jarvis',
];

function matchesWakeWord(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return WAKE_PATTERNS.some(p => lower.includes(p));
}

function stripWakeWord(text: string): string {
  let result = text.toLowerCase().trim();
  for (const p of WAKE_PATTERNS) {
    const idx = result.indexOf(p);
    if (idx !== -1) {
      result = result.slice(idx + p.length).trim();
      break;
    }
  }
  return result;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function WakeWordWidget() {
  const [permission, setPermission]       = useState<PermissionState>('unknown');
  const [listenerState, setListenerState] = useState<ListenerState>('idle');
  const [liveText, setLiveText]           = useState('');
  const [commandText, setCommandText]     = useState('');

  const recognitionRef   = useRef<any>(null);
  const restartTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const awakeTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef       = useRef(false);      // source of truth for restart loop
  const stateRef         = useRef<ListenerState>('idle');

  const { toast }                          = useToast();
  const { data: tasks = [] }              = useTasks();
  const { data: categories = [] }         = useCategories();
  const createTask                         = useCreateTask();
  const updateTask                         = useUpdateTask();
  const deleteTask                         = useDeleteTask();

  // Keep stateRef in sync
  const setLS = (s: ListenerState) => {
    stateRef.current = s;
    setListenerState(s);
  };

  // ── Permission request ─────────────────────────────────────────────────────
  const requestPermission = useCallback(async () => {
    setPermission('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release immediately — we just needed the prompt
      stream.getTracks().forEach(t => t.stop());
      setPermission('granted');
      return true;
    } catch {
      setPermission('denied');
      return false;
    }
  }, []);

  // ── Execute command ────────────────────────────────────────────────────────
  const handleExecute = useCallback(async (cmd: string) => {
    if (!cmd.trim()) return;
    setLS('processing');
    setCommandText('Processing…');
    await executeVoiceCommand(
      cmd, tasks, '', null, true, 'default', '09:00',
      createTask, updateTask, deleteTask, toast,
      () => {
        setLS('idle');
        setCommandText('');
        setLiveText('');
      },
      '', categories
    );
  }, [tasks, categories, createTask, updateTask, deleteTask, toast]);

  // ── Cancel awake mode ──────────────────────────────────────────────────────
  const cancelAwake = useCallback(() => {
    if (awakeTimerRef.current) { clearTimeout(awakeTimerRef.current); awakeTimerRef.current = null; }
    setLS('idle');
    setCommandText('');
    setLiveText('');
  }, []);

  // ── Core recognition loop ──────────────────────────────────────────────────
  const startRecognition = useCallback(() => {
    if (recognitionRef.current) return;           // already running
    if (!enabledRef.current) return;              // stopped by user

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.lang            = 'en-US';
    rec.maxAlternatives = 3;

    rec.onstart = () => {
      if (stateRef.current === 'idle') setLS('listening');
    };

    rec.onresult = (event: any) => {
      // Build the full running transcript for this session
      let fullText = '';
      for (let i = 0; i < event.results.length; i++) {
        // Check all alternatives for better wake-word matching
        const best = event.results[i][0].transcript;
        fullText += best + ' ';
      }
      fullText = fullText.trim();
      setLiveText(fullText);

      const isLastFinal = event.results[event.results.length - 1].isFinal;

      if (stateRef.current === 'listening') {
        // Look for wake word
        if (matchesWakeWord(fullText)) {
          setLS('awake');
          setCommandText('');
          // Safety timeout — if nothing follows in 10 s, go back to sleep
          if (awakeTimerRef.current) clearTimeout(awakeTimerRef.current);
          awakeTimerRef.current = setTimeout(() => {
            if (stateRef.current === 'awake') cancelAwake();
          }, 10_000);
        }
      } else if (stateRef.current === 'awake') {
        // Extract command portion that came after the wake word
        const cmd = stripWakeWord(fullText);
        if (cmd.length > 0) setCommandText(cmd);

        if (isLastFinal && cmd.length >= 3) {
          if (awakeTimerRef.current) clearTimeout(awakeTimerRef.current);
          handleExecute(cmd);
        }
      }
    };

    rec.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setPermission('denied');
        enabledRef.current = false;
        setLS('idle');
        return;
      }
      // For transient errors (network, no-speech, audio-capture) just let onend handle restart
    };

    rec.onend = () => {
      recognitionRef.current = null;
      if (stateRef.current === 'listening') setLS('idle');   // briefly idle before restart

      // Restart unless the user has toggled off
      if (enabledRef.current) {
        restartTimerRef.current = setTimeout(() => startRecognition(), 300);
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      recognitionRef.current = null;
      if (enabledRef.current) {
        restartTimerRef.current = setTimeout(() => startRecognition(), 500);
      }
    }
  // startRecognition intentionally omitted to avoid creating a new fn every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleExecute, cancelAwake]);

  // ── Stop recognition completely ────────────────────────────────────────────
  const stopRecognition = useCallback(() => {
    enabledRef.current = false;
    if (restartTimerRef.current) { clearTimeout(restartTimerRef.current); restartTimerRef.current = null; }
    if (awakeTimerRef.current)   { clearTimeout(awakeTimerRef.current);   awakeTimerRef.current = null; }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;     // prevent restart
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setLS('idle');
    setLiveText('');
    setCommandText('');
  }, []);

  // ── Toggle button handler ──────────────────────────────────────────────────
  const handleToggle = useCallback(async () => {
    if (enabledRef.current) {
      // Turn off
      stopRecognition();
      localStorage.setItem('voxa_ambient_enabled', 'false');
    } else {
      // Need microphone permission first
      let ok = permission === 'granted';
      if (!ok) ok = await requestPermission();
      if (!ok) return;

      enabledRef.current = true;
      localStorage.setItem('voxa_ambient_enabled', 'true');
      startRecognition();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission, requestPermission, stopRecognition, startRecognition]);

  // ── Auto-start if previously enabled ──────────────────────────────────────
  useEffect(() => {
    const wasEnabled = localStorage.getItem('voxa_ambient_enabled') === 'true';
    if (!wasEnabled) return;

    // Check permission state via Permissions API if available
    const doStart = async () => {
      if (navigator.permissions) {
        try {
          const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (status.state === 'granted') {
            setPermission('granted');
            enabledRef.current = true;
            startRecognition();
          } else if (status.state === 'denied') {
            setPermission('denied');
            localStorage.setItem('voxa_ambient_enabled', 'false');
          }
          // If 'prompt', do nothing — wait for the user to click the button
        } catch {
          // Permissions API not supported; try starting anyway
          enabledRef.current = true;
          startRecognition();
        }
      } else {
        enabledRef.current = true;
        startRecognition();
      }
    };
    doStart();

    return () => stopRecognition();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Derived UI values ───────────────────────────────────────────────────────
  const isEnabled  = enabledRef.current;
  const isListening = listenerState === 'listening';
  const isAwake    = listenerState === 'awake';
  const isProc     = listenerState === 'processing';
  const isDenied   = permission === 'denied';

  return (
    <>
      {/* ── Slide-down wake panel ─────────────────────────────────────────── */}
      <AnimatePresence>
        {(isAwake || isProc) && (
          <motion.div
            key="wake-panel"
            initial={{ y: -90, opacity: 0, scale: 0.95 }}
            animate={{ y: 0,   opacity: 1, scale: 1    }}
            exit={{   y: -90, opacity: 0, scale: 0.95  }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999]"
          >
            <div className="relative flex items-center gap-4 px-5 py-3.5 rounded-[2rem] min-w-[300px] max-w-[90vw] overflow-hidden
                            bg-[#080a0e]/95 backdrop-blur-[60px] border border-white/[0.12]
                            shadow-[0_30px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(99,102,241,0.12)]">
              {/* Top shimmer */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

              {/* Pulsing icon */}
              <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  <Activity className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.9)]" />
                </motion.div>
              </div>

              {/* Text */}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-indigo-400/70 mb-0.5">
                  VoXa · {isProc ? 'Processing' : 'Listening for command'}
                </span>
                <p className="text-[14px] font-semibold text-white/90 truncate">
                  {commandText || 'Say your command…'}
                </p>
              </div>

              {/* Dismiss */}
              {!isProc && (
                <button
                  onClick={cancelAwake}
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ambient status pill (bottom-left) ─────────────────────────────── */}
      <div className="fixed bottom-6 left-6 z-[90]">
        <button
          onClick={handleToggle}
          className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border backdrop-blur-xl
                      shadow-2xl transition-all duration-300
                      ${isDenied
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        : isEnabled
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
                        : 'bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/70'
                      }`}
        >
          {/* Status dot */}
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300
                          ${isDenied   ? 'bg-red-400'
                          : isListening ? 'bg-indigo-400 animate-pulse shadow-[0_0_6px_#6366f1]'
                          : isAwake || isProc ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : isEnabled  ? 'bg-indigo-600/60'
                          : 'bg-white/20'}`}
          />

          {/* Label */}
          <div className="flex flex-col items-start leading-none gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {isDenied         ? 'Mic Denied'
               : permission === 'requesting' ? 'Requesting…'
               : isEnabled     ? 'Ambient On'
               :                 'Ambient Off'}
            </span>
            {isEnabled && !isDenied && (
              <span className="text-[8px] font-medium opacity-60 tracking-wide normal-case max-w-[120px] truncate">
                {isProc   ? 'Running command…'
                 : isAwake ? 'Heard wake word!'
                 : liveText ? liveText
                 : 'Say "VoXa, …"'}
              </span>
            )}
          </div>

          {/* Icon */}
          {isDenied
            ? <AlertCircle className="w-3 h-3 shrink-0 opacity-70" />
            : isEnabled
            ? <Mic className="w-3 h-3 shrink-0 opacity-60" />
            : <MicOff className="w-3 h-3 shrink-0 opacity-40 group-hover:opacity-70 transition-opacity" />
          }
        </button>

        {/* Mic denied helper */}
        {isDenied && (
          <p className="mt-1.5 text-[9px] text-red-400/70 max-w-[180px] leading-relaxed pl-1">
            Enable microphone in browser site settings, then click to retry.
          </p>
        )}
      </div>
    </>
  );
}
