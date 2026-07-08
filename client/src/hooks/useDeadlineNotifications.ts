import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const ALARM_SOUND_URL = 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';

export function useDeadlineNotifications(tasks: any[]) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();
  
  // Track which tasks have been notified in the current session
  const notifiedTasksRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const showNotification = useCallback((task: any, title: string, body: string) => {
    // Check alarm preference
    const alarmSoundEnabled = localStorage.getItem('voxa_alarm_sound') !== 'false';
    
    // Play ringing alarm sound if enabled
    // Audio playback is now handled by the AlarmModal component.

    // Show toast for immediate UI feedback (Always works)
    toast({
      title,
      description: body,
      duration: 10000,
    });

    // Show browser notification if permission is granted
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/logo.png',
          tag: `task-${task.id}`,
        });
      } catch (e) {
        console.warn('Browser notification failed:', e);
      }
    }
  }, [toast]);

  useEffect(() => {
    const checkReminders = () => {
      if (!tasks) return;
      const now = new Date();
      const nowTs = now.getTime();

      tasks.forEach(task => {
        if (!task.dueDate || task.completed || !task.reminderEnabled) return;

        const dueDate = new Date(task.dueDate);
        const dueTs = dueDate.getTime();
        const diffMinutes = (dueTs - nowTs) / (1000 * 60);
        
        let notificationKey = '';
        let shouldNotify = false;
        let title = "⏰ Task Reminder";
        let body = "";

        if (task.reminderType === 'default') {
          // Trigger exactly 30, 15, and 5 minutes before deadline
          const intervals = [30, 15, 5];
          const reachedInterval = intervals.find(mins => diffMinutes <= mins && diffMinutes > mins - 1);
          
          if (reachedInterval !== undefined) {
             notificationKey = `${task.id}-default-${reachedInterval}`;
             shouldNotify = true;
             body = `"${task.title}" is due in ${reachedInterval} minutes!`;
          }
        } 
        else if (task.reminderType === 'morning') {
          // Trigger at 9 AM on the day of deadline
          if (now.getHours() === 9 && dueDate.toDateString() === now.toDateString()) {
            notificationKey = `${task.id}-morning-${now.toDateString()}`;
            shouldNotify = true;
            title = "🌅 Morning Brief";
            body = `Task "${task.title}" is due today.`;
          }
        }
        else if (task.reminderType === 'manual' && task.reminderTime) {
          const [targetH, targetM] = task.reminderTime.split(':').map(Number);
          if (now.getHours() === targetH && now.getMinutes() === targetM) {
            notificationKey = `${task.id}-manual-${now.toDateString()}-${task.reminderTime}`;
            shouldNotify = true;
            title = "🔔 Scheduled Alert";
            body = `Reminder for "${task.title}"`;
          }
        }

        if (shouldNotify && !notifiedTasksRef.current[notificationKey]) {
          notifiedTasksRef.current[notificationKey] = nowTs;
          // Dispatch custom event for the AlarmModal
          window.dispatchEvent(new CustomEvent('voxa-alarm-trigger', { 
            detail: { task, title, body } 
          }));
          
          // Also show the toast and browser notification as backup
          showNotification(task, title, body);
        }
      });
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    checkReminders();

    return () => clearInterval(interval);
  }, [tasks, showNotification]);

  return { permission: notificationPermission };
}
