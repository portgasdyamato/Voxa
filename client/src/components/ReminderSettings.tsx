import { Clock, Bell, Sun, ChevronRight, Info, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ReminderSettingsProps {
  reminderEnabled: boolean;
  reminderType: 'manual' | 'morning' | 'default';
  reminderTime?: string;
  onReminderEnabledChange: (enabled: boolean) => void;
  onReminderTypeChange: (type: 'manual' | 'morning' | 'default') => void;
  onReminderTimeChange: (time: string) => void;
}

export function ReminderSettings({
  reminderEnabled,
  reminderType,
  reminderTime,
  onReminderEnabledChange,
  onReminderTypeChange,
  onReminderTimeChange,
}: ReminderSettingsProps) {
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push({ value: timeStr, label: timeStr });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4 py-5 glass border-white/5 rounded-3xl group hover:bg-white/[0.04] transition-all">
        <div className="flex items-center gap-5">
           <div className={cn(
             "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
             reminderEnabled ? "bg-primary/20 border-primary/40 shadow-[0_0_20px_rgba(var(--primary),0.2)]" : "bg-white/5 border-white/5 opacity-40"
           )}>
             <Bell className={cn("w-6 h-6 transition-colors", reminderEnabled ? "text-primary" : "text-white/40")} />
           </div>
           <div className="space-y-0.5">
             <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/80 italic">Neural Alert Link</Label>
             <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest italic">Direct Temporal Notification Stream</p>
           </div>
        </div>
        <Switch
          checked={reminderEnabled}
          onCheckedChange={onReminderEnabledChange}
          className="data-[state=checked]:bg-primary shadow-xl"
        />
      </div>

      <AnimatePresence>
        {reminderEnabled && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            className="space-y-6 pt-6 border-t border-white/5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-2 italic flex items-center gap-2">
                  <ShieldAlert className="w-3 h-3" /> Alert Protocol
                </Label>
                <Select value={reminderType} onValueChange={onReminderTypeChange}>
                  <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] pl-6 italic hover:bg-white/10 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-[2rem] glass border-white/5 p-2">
                    <SelectItem value="default" className="rounded-xl font-black uppercase tracking-[0.2em] text-[9px] py-4 italic">Standard (T-2h)</SelectItem>
                    <SelectItem value="morning" className="rounded-xl font-black uppercase tracking-[0.2em] text-[9px] py-4 italic">Morning Brief (08:00)</SelectItem>
                    <SelectItem value="manual" className="rounded-xl font-black uppercase tracking-[0.2em] text-[9px] py-4 italic">Custom Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reminderType === 'manual' && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-2 italic flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Sync Window
                  </Label>
                  <Select value={reminderTime || '09:00'} onValueChange={onReminderTimeChange}>
                    <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] pl-6 italic hover:bg-white/10 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 rounded-[1.5rem] glass border-white/5">
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="font-black uppercase tracking-[0.2em] text-[9px] py-3">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-primary/[0.03] border-2 border-primary/10 flex gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-all">
                 <Cpu className="w-12 h-12" />
              </div>
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                 <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/40 italic">System Status Report</span>
                 <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.1em] leading-relaxed italic">
                    {reminderType === 'default' && "INTERCEPT: NOTIFICATION UPLINK AT T-MINUS 120 MINUTES."}
                    {reminderType === 'morning' && "INTERCEPT: MORNING INTELLIGENCE BRIEF AT 08:00 HOURS."}
                    {reminderType === 'manual' && `INTERCEPT: SCHEDULED ALERT SYNCHRONIZED FOR ${reminderTime} HOURS.`}
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
