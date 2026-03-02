import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DeadlineNotification {
  id: number;
  title: string;
  dueDate: Date;
  reminderType: 'manual' | 'morning' | 'default';
  reminderTime?: string;
  reminderEnabled: boolean;
}

export function useDeadlineNotifications(tasks: any[]) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();
  
  // Track which tasks have been notified in the current session to avoid duplicates
  const notifiedTasksRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const showNotification = useCallback((task: any, title: string, body: string) => {
    // Show toast for immediate UI feedback
    toast({
      title,
      description: body,
      duration: 10000,
    });

    // Show device-level push notification via Service Worker
    if (Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: `task-${task.id}`,
            vibrate: [100, 50, 100],
            data: {
              url: '/'
            },
            renotify: true
          } as any);
        }).catch(err => {
          console.warn('SW notification failed:', err);
          // Fallback to legacy notification if SW fails
          new Notification(title, { body, icon: '/logo.png', tag: `task-${task.id}` });
        });
      } else {
        // Fallback for browsers without SW support
        new Notification(title, { body, icon: '/logo.png', tag: `task-${task.id}` });
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
        
        // Unique key for this notification window to avoid re-triggering if user refreshes
        // For 'default' (2h), the window is the hour before.
        // For 'manual' or 'morning', the window is the date + time.
        let notificationKey = '';
        let shouldNotify = false;
        let title = "⏰ Task Reminder";
        let body = "";

        if (task.reminderType === 'default') {
          // Trigger within 2 hours of deadline
          if (diffMinutes <= 120 && diffMinutes > -5) {
            notificationKey = `${task.id}-default-${dueDate.getHours()}`;
            shouldNotify = true;
            body = `"${task.title}" is due in ${Math.max(0, Math.ceil(diffMinutes))} minutes!`;
          }
        } 
        else if (task.reminderType === 'morning') {
          // Trigger at 8 AM on the day of deadline
          if (now.getHours() === 8 && dueDate.toDateString() === now.toDateString()) {
            notificationKey = `${task.id}-morning-${now.toDateString()}`;
            shouldNotify = true;
            title = "🌅 Morning Brief";
            body = `Task "${task.title}" is due today.`;
          }
        }
        else if (task.reminderType === 'manual' && task.reminderTime) {
          // Trigger at the specified time
          const [targetH, targetM] = task.reminderTime.split(':').map(Number);
          if (now.getHours() === targetH && now.getMinutes() === targetM) {
            notificationKey = `${task.id}-manual-${now.toDateString()}-${task.reminderTime}`;
            shouldNotify = true;
            title = "🔔 Scheduled Alert";
            body = `Task "${task.title}" reminder.`;
          }
        }

        // Only notify if we haven't already notified for this specific trigger key
        if (shouldNotify && !notifiedTasksRef.current[notificationKey]) {
          notifiedTasksRef.current[notificationKey] = nowTs;
          showNotification(task, title, body);
        }
      });
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [tasks, showNotification]);

  return { permission: notificationPermission };
}
