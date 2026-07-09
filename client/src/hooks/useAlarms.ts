import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const ALARM_SOUND_URL = 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';

export function useAlarms(tasks: any[] = [], events: any[] = []) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();
  
  // Track which tasks/events have been notified in the current session
  const notifiedTasksRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // Register Service Worker for Push Notifications
      if ('serviceWorker' in navigator && 'PushManager' in window && Notification.permission === 'granted') {
        navigator.serviceWorker.register('/sw.js').then(async (registration) => {
          let subscription = await registration.pushManager.getSubscription();
          
          if (!subscription) {
            const publicVapidKey = 'BA0CBd22G-cwAJLrG1kIuQu9yO4gy5vYjlZ2CJWxmhSmNXe2rp3H6iU7F6iFMOnN5Y7SsHQLTY9I1et9wo6i-qI';
            
            // Convert VAPID key to Uint8Array
            const padding = '='.repeat((4 - publicVapidKey.length % 4) % 4);
            const base64 = (publicVapidKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
              outputArray[i] = rawData.charCodeAt(i);
            }

            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: outputArray
            });
          }

          // Send subscription to server
          fetch('/api/push/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
              'Content-Type': 'application/json'
            }
          }).catch(err => console.error("Failed to save push subscription", err));
          
        }).catch(err => console.error('Service Worker registration failed', err));
      }
    }
  }, []);

  const showNotification = useCallback((item: any, title: string, body: string, isEvent: boolean = false) => {
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
          tag: `${isEvent ? 'event' : 'task'}-${item.id}`,
        });
      } catch (e) {
        console.warn('Browser notification failed:', e);
      }
    }
  }, [toast]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const nowTs = now.getTime();

      const checkItem = (item: any, isEvent: boolean) => {
        const targetDate = isEvent ? new Date(item.startTime) : (item.dueDate ? new Date(item.dueDate) : null);
        if (!targetDate || isNaN(targetDate.getTime())) return;
        
        // Skip completed tasks or tasks with reminders explicitly disabled
        if (!isEvent && (item.completed || item.reminderEnabled === false)) return;

        const targetTs = targetDate.getTime();
        const diffMinutes = (targetTs - nowTs) / (1000 * 60);
        
        let notificationKey = '';
        let shouldNotify = false;
        let title = isEvent ? "📅 Event Reminder" : "⏰ Task Reminder";
        let body = "";
        
        const itemPrefix = isEvent ? `event-${item.id}` : `task-${item.id}`;

        // 1. Start of the day (Trigger at 8:00 AM on the day of the event/task)
        if (now.getHours() === 8 && now.getMinutes() === 0 && targetDate.toDateString() === now.toDateString()) {
          notificationKey = `${itemPrefix}-start-of-day-${now.toDateString()}`;
          shouldNotify = true;
          title = "🌅 Morning Brief";
          body = `"${item.title}" is scheduled for today.`;
        }

        // 2. Exact intervals: 30 minutes, 15 minutes, 5 minutes before
        const intervals = [30, 15, 5];
        const reachedInterval = intervals.find(mins => diffMinutes <= mins && diffMinutes > mins - 1);
        
        if (reachedInterval !== undefined) {
          notificationKey = `${itemPrefix}-interval-${reachedInterval}`;
          shouldNotify = true;
          body = `"${item.title}" is coming up in ${reachedInterval} minutes!`;
        }

        // 3. Keep support for manually scheduled task reminders
        if (!isEvent && item.reminderType === 'manual' && item.reminderTime) {
          const [targetH, targetM] = item.reminderTime.split(':').map(Number);
          if (now.getHours() === targetH && now.getMinutes() === targetM && targetDate.toDateString() === now.toDateString()) {
            notificationKey = `${itemPrefix}-manual-${now.toDateString()}-${item.reminderTime}`;
            shouldNotify = true;
            title = "🔔 Scheduled Alert";
            body = `Reminder for "${item.title}"`;
          }
        }

        if (shouldNotify && !notifiedTasksRef.current[notificationKey]) {
          notifiedTasksRef.current[notificationKey] = nowTs;
          
          // Dispatch custom event for the AlarmModal audio playback
          window.dispatchEvent(new CustomEvent('voxa-alarm-trigger', { 
            detail: { task: item, title, body, isEvent } 
          }));
          
          showNotification(item, title, body, isEvent);
        }
      };

      if (tasks && tasks.length > 0) {
        tasks.forEach(task => checkItem(task, false));
      }
      
      if (events && events.length > 0) {
        events.forEach(event => checkItem(event, true));
      }
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    checkReminders(); // Check immediately on mount

    return () => clearInterval(interval);
  }, [tasks, events, showNotification]);

  return { permission: notificationPermission };
}
