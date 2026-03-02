import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

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
          // Trigger within 2 hours of deadline
          if (diffMinutes <= 120 && diffMinutes > -5) {
            notificationKey = `${task.id}-default-${dueDate.getHours()}`;
            shouldNotify = true;
            body = `"${task.title}" is due soon!`;
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
