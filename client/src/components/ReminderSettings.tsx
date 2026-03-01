import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, Clock, Calendar, CheckCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ReminderSettingsProps {
  reminderEnabled: boolean;
  reminderType: 'manual' | 'morning' | 'default';
  reminderTime: string;
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
  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/30 border border-border group hover:bg-muted/50 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
            reminderEnabled ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground/30 border border-border"
          )}>
            <Bell className={cn("w-6 h-6", reminderEnabled ? "animate-bounce" : "opacity-40")} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold tracking-tight text-foreground">Reminders</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Get notified when tasks are due</p>
          </div>
        </div>
        <Switch 
          checked={reminderEnabled} 
          onCheckedChange={onReminderEnabledChange}
          className="data-[state=checked]:bg-primary shadow-sm"
        />
      </div>

      <AnimatePresence>
        {reminderEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            className="space-y-6 pt-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-1">Reminder Type</p>
                <Select value={reminderType} onValueChange={(v: any) => onReminderTypeChange(v)}>
                  <SelectTrigger className="h-12 rounded-xl border-border bg-muted/20 text-xs font-semibold pl-6">
                    <SelectValue placeholder="Standard Notification" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border p-2">
                    <SelectItem value="default" className="rounded-xl py-3 font-semibold text-xs">Standard Reminder</SelectItem>
                    <SelectItem value="morning" className="rounded-xl py-3 font-semibold text-xs text-primary">Day-of (at 9:00 AM)</SelectItem>
                    <SelectItem value="manual" className="rounded-xl py-3 font-semibold text-xs text-amber-600">Custom Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reminderType === 'manual' && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-1">Custom Time</p>
                  <Input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => onReminderTimeChange(e.target.value)}
                    className="h-12 rounded-xl border-border bg-muted/20 text-xs font-semibold px-6"
                  />
                </motion.div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 flex items-center gap-3">
               <Zap className="w-4 h-4 text-primary" />
               <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                 Notification status: <span className="text-foreground">Synced & Active</span>
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
