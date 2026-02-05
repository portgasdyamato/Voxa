import { useState } from 'react';
import { Clock, Bell, Sun, Settings, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = new Date(`2000-01-01T${timeStr}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      timeOptions.push({ value: timeStr, label: displayTime });
    }
  }

  return (
    <div className="space-y-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-4 rounded-2xl bg-muted/50 border-2 border-border/50 hover:bg-muted transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Bell className="w-5 h-5" />
          </div>
          <div className="text-left">
             <h4 className="text-sm font-black uppercase tracking-widest leading-none mb-1">Reminder Protocol</h4>
             <p className="text-[10px] font-medium text-muted-foreground">Configure notification triggers</p>
          </div>
        </div>
        <ChevronRight className={cn("w-5 h-5 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6 rounded-2xl border-2 border-border/50 bg-background/50">
              <div className="flex items-center justify-between">
                <Label htmlFor="reminder-enabled" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Status Active
                </Label>
                <Switch
                  id="reminder-enabled"
                  checked={reminderEnabled}
                  onCheckedChange={onReminderEnabledChange}
                />
              </div>

              {reminderEnabled && (
                <div className="space-y-6 pt-4 border-t-2 border-dashed">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Trigger Mode</Label>
                    <Select value={reminderType} onValueChange={onReminderTypeChange}>
                      <SelectTrigger className="h-12 rounded-xl border-2 bg-muted/30 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-2 p-1">
                        <SelectItem value="default" className="rounded-xl font-bold">Standard Offset (2h)</SelectItem>
                        <SelectItem value="morning" className="rounded-xl font-bold">Morning Brief (8:00 AM)</SelectItem>
                        <SelectItem value="manual" className="rounded-xl font-bold">Custom Timestamp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {reminderType === 'manual' && (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Specific Timestamp</Label>
                      <Select value={reminderTime || ''} onValueChange={onReminderTimeChange}>
                        <SelectTrigger className="h-12 rounded-xl border-2 bg-muted/30 font-bold">
                          <SelectValue placeholder="Select target time..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 rounded-2xl border-2 p-1">
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="rounded-xl font-bold">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-primary leading-relaxed opacity-80">
                      {reminderType === 'default' && "System will trigger a notification exactly 2 hours prior to the defined deadline."}
                      {reminderType === 'morning' && "Operational summary will be delivered at 08:00 on the day of deadline."}
                      {reminderType === 'manual' && reminderTime && `Targeted alert scheduled for ${new Date(`2000-01-01T${reminderTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on the zero date.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
