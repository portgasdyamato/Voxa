import { useState } from 'react';
import { Clock, Bell, Sun, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeStr}`).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        options.push({ value: timeStr, label: displayTime });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Reminder Settings
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            <Settings className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Enable/Disable Reminder */}
          <div className="flex items-center justify-between">
            <Label htmlFor="reminder-enabled" className="text-sm font-medium">
              Enable Reminder
            </Label>
            <Switch
              id="reminder-enabled"
              checked={reminderEnabled}
              onCheckedChange={onReminderEnabledChange}
            />
          </div>

          {reminderEnabled && (
            <>
              {/* Reminder Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Reminder Type</Label>
                <Select value={reminderType} onValueChange={onReminderTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reminder type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Default (2 hours before)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="morning">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        <span>Morning Only (8:00 AM)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="manual">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Custom Time</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Manual Time Selection */}
              {reminderType === 'manual' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Reminder Time</Label>
                  <Select value={reminderTime || ''} onValueChange={onReminderTimeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Info Text */}
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                {reminderType === 'default' && (
                  <span>You'll receive notifications 2 hours before the deadline.</span>
                )}
                {reminderType === 'morning' && (
                  <span>You'll receive notifications at 8:00 AM on days when tasks are due.</span>
                )}
                {reminderType === 'manual' && reminderTime && (
                  <span>You'll receive notifications at {
                    new Date(`2000-01-01T${reminderTime}`).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  } on the day tasks are due.</span>
                )}
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
