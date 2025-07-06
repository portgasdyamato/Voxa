import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DeadlineNotification {
  id: number;
  title: string;
  dueDate: Date;
  reminderType: 'manual' | 'morning' | 'default';
  reminderTime?: string;
  reminderEnabled: boolean;
  lastNotified?: Date;
  notified: boolean;
}

export function useDeadlineNotifications(tasks: any[]) {
  const [notifications, setNotifications] = useState<DeadlineNotification[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [debugMode, setDebugMode] = useState(false);
  const { toast } = useToast();

  // Enable debug mode in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      setDebugMode(true);
    }
  }, []);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
          if (permission === 'granted') {
            toast({
              title: "Notifications Enabled",
              description: "You'll receive reminders for upcoming deadlines!",
              duration: 3000,
            });
          }
        });
      }
    }
  }, [toast]);

  // Process tasks for deadline notifications
  useEffect(() => {
    if (debugMode) {
      console.log('Processing tasks for notifications:', tasks?.length || 0, 'tasks');
    }
    
    if (!tasks || tasks.length === 0) {
      setNotifications([]);
      return;
    }

    const now = new Date();
    
    // Find tasks that have reminders enabled and are not completed
    const upcomingTasks = tasks.filter(task => {
      if (!task.dueDate || task.completed || !task.reminderEnabled) return false;
      
      const dueDate = new Date(task.dueDate);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (debugMode) {
        console.log(`Task "${task.title}" due in ${hoursUntilDue.toFixed(2)} hours, reminder type: ${task.reminderType || 'default'}`);
      }
      
      // Include tasks based on reminder type
      if (task.reminderType === 'default') {
        // Default: within 24 hours
        return hoursUntilDue > -24 && hoursUntilDue <= 24;
      } else if (task.reminderType === 'morning' || task.reminderType === 'manual') {
        // Morning/Manual: include if due today or in the future
        return hoursUntilDue > -24;
      }
      
      return false;
    });

    const newNotifications: DeadlineNotification[] = upcomingTasks.map(task => ({
      id: task.id,
      title: task.title,
      dueDate: new Date(task.dueDate),
      reminderType: task.reminderType || 'default',
      reminderTime: task.reminderTime,
      reminderEnabled: task.reminderEnabled,
      lastNotified: task.lastNotified ? new Date(task.lastNotified) : undefined,
      notified: false
    }));

    if (debugMode) {
      console.log('New notifications created:', newNotifications.length);
    }

    setNotifications(newNotifications);
  }, [tasks, debugMode]);

  const showNotification = useCallback((notification: DeadlineNotification) => {
    const now = new Date();
    const hoursUntilDue = Math.ceil((notification.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    let timeText = '';
    let title = '';
    
    if (notification.reminderType === 'morning') {
      title = "🌅 Morning Reminder";
      timeText = `Task "${notification.title}" is due today`;
    } else if (notification.reminderType === 'manual') {
      title = "⏰ Scheduled Reminder";
      timeText = `Task "${notification.title}" reminder`;
    } else {
      // Default reminder
      title = "⏰ Task Deadline Reminder";
      if (hoursUntilDue <= 1) {
        const minutesUntilDue = Math.ceil((notification.dueDate.getTime() - now.getTime()) / (1000 * 60));
        timeText = minutesUntilDue <= 0 ? 'now' : `${minutesUntilDue} minute${minutesUntilDue === 1 ? '' : 's'}`;
      } else {
        timeText = `${hoursUntilDue} hour${hoursUntilDue === 1 ? '' : 's'}`;
      }
      timeText = `"${notification.title}" is due ${timeText === 'now' ? 'now' : `in ${timeText}`}!`;
    }
    
    // Show toast notification
    toast({
      title,
      description: timeText,
      duration: 8000,
      variant: "default",
    });

    // Show browser notification if permission granted
    if (notificationPermission === 'granted') {
      try {
        new Notification(title, {
          body: timeText,
          icon: '/favicon.ico',
          tag: `task-${notification.id}`,
          requireInteraction: true,
          silent: false
        });
      } catch (error) {
        console.warn('Failed to show browser notification:', error);
      }
    }
  }, [notificationPermission, toast]);

  // Check for notifications that should be shown
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      
      if (debugMode) {
        console.log('Checking notifications at:', now.toISOString());
        console.log('Notifications to check:', notifications.length);
      }
      
      notifications.forEach(notification => {
        if (!notification.notified && notification.reminderEnabled) {
          const shouldShowNotification = shouldShowNotificationForTask(notification, now);
          
          if (debugMode) {
            console.log(`Task "${notification.title}" should show notification: ${shouldShowNotification}`);
          }
          
          if (shouldShowNotification) {
            if (debugMode) {
              console.log(`Showing notification for task: ${notification.title}`);
            }
            showNotification(notification);
            
            // Mark as notified
            setNotifications(prev => 
              prev.map(n => 
                n.id === notification.id 
                  ? { ...n, notified: true }
                  : n
              )
            );
          }
        }
      });
    };

    if (notifications.length > 0) {
      // Check immediately
      checkNotifications();
      
      // Set up interval to check every 30 seconds
      const interval = setInterval(checkNotifications, 30000);
      
      return () => clearInterval(interval);
    }
  }, [notifications, showNotification, debugMode]);

  // Helper function to determine if notification should be shown
  const shouldShowNotificationForTask = (notification: DeadlineNotification, now: Date): boolean => {
    const dueDate = notification.dueDate;
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    switch (notification.reminderType) {
      case 'default':
        // Show notification if task is due within 2 hours or overdue
        return hoursUntilDue <= 2;
        
      case 'morning':
        // Show notification only in the morning (8 AM) if due today
        const isMorning = now.getHours() === 8 && now.getMinutes() < 30;
        const isDueToday = dueDate.toDateString() === now.toDateString();
        return isMorning && isDueToday;
        
      case 'manual':
        // Show notification at the specified time if due today
        if (!notification.reminderTime) return false;
        const [hours, minutes] = notification.reminderTime.split(':').map(Number);
        const isCorrectTime = now.getHours() === hours && now.getMinutes() >= minutes && now.getMinutes() < minutes + 30;
        const isDueTodayOrLater = dueDate.toDateString() === now.toDateString() || dueDate > now;
        return isCorrectTime && isDueTodayOrLater;
        
      default:
        return false;
    }
  };

  const requestPermission = useCallback(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === 'granted') {
          toast({
            title: "Notifications Enabled",
            description: "You'll receive reminders for upcoming deadlines!",
            duration: 3000,
          });
        } else if (permission === 'denied') {
          toast({
            title: "Notifications Blocked",
            description: "Please enable notifications in your browser settings for deadline reminders.",
            variant: "destructive",
            duration: 5000,
          });
        }
      });
    }
  }, [toast]);

  const testNotification = useCallback(() => {
    if (notificationPermission === 'granted') {
      toast({
        title: "🔔 Test Notification",
        description: "Notifications are working! You'll receive reminders for upcoming deadlines.",
        duration: 4000,
      });
      try {
        new Notification('🔔 Test Notification', {
          body: 'Notifications are working! You\'ll receive reminders for upcoming deadlines.',
          icon: '/favicon.ico',
        });
      } catch (error) {
        console.warn('Browser notification failed:', error);
      }
    } else {
      toast({
        title: "Notifications Disabled",
        description: "Please enable notifications first.",
        variant: "destructive",
      });
    }
  }, [notificationPermission, toast]);

  return {
    notifications,
    notificationPermission,
    requestPermission,
    testNotification
  };
}
