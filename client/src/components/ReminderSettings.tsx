import { Clock, Bell, Sun, ChevronRight, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push({ value: timeStr, label: timeStr });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-0.5">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Reminders</Label>
          <p className="text-[10px] text-muted-foreground/40">Push notifications for deadlines</p>
        </div>
        <Switch
          checked={reminderEnabled}
          onCheckedChange={onReminderEnabledChange}
        />
      </div>

      {reminderEnabled && (
        <div className="space-y-4 pt-4 border-t border-border/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-0.5">Trigger</Label>
              <Select value={reminderType} onValueChange={onReminderTypeChange}>
                <SelectTrigger className="h-9 rounded-lg border-border/50 bg-muted/20 text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="default" className="text-xs">Standard (2h)</SelectItem>
                  <SelectItem value="morning" className="text-xs">Morning (8 AM)</SelectItem>
                  <SelectItem value="manual" className="text-xs">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reminderType === 'manual' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-0.5">Time</Label>
                <Select value={reminderTime || '09:00'} onValueChange={onReminderTimeChange}>
                  <SelectTrigger className="h-9 rounded-lg border-border/50 bg-muted/20 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 rounded-xl">
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-primary/[0.03] border border-primary/10 flex gap-2.5">
            <Info className="w-3.5 h-3.5 text-primary/60 shrink-0 mt-0.5" />
            <p className="text-[10px] text-primary/60 font-medium leading-relaxed">
              {reminderType === 'default' && "System will fire a push notification exactly 2 hours prior to the deadline."}
              {reminderType === 'morning' && "Operational brief will be delivered at 08:00 on the day of the objective."}
              {reminderType === 'manual' && `Scheduled alert for ${reminderTime} on the day of the deadline.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
