import { useState, useEffect, useCallback } from 'react';
import { useNotificationSettings } from './useNotificationSettings';
import { playNotificationSound } from './sounds';

export type Reminder = {
  id: string;
  title: string;
  time: Date;
  icon: string;
  sound?: boolean;
  soundType?: string;
  vibration?: boolean;
};

const STORAGE_KEY = 'reminders';

const parseStoredReminders = (stored: string | null): Reminder[] => {
  try {
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((reminder: any) => ({
      ...reminder,
      time: new Date(reminder.time)
    }));
  } catch (error) {
    console.error('Error parsing stored reminders:', error);
    return [];
  }
};

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => 
    parseStoredReminders(localStorage.getItem(STORAGE_KEY))
  );
  const [activeReminders, setActiveReminders] = useState<string[]>([]);
  const { shouldPlaySound, shouldVibrate } = useNotificationSettings();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  }, [reminders]);

  const showNotification = useCallback(async (reminder: Reminder) => {
    try {
      if (reminder.sound && shouldPlaySound()) {
        await playNotificationSound(reminder.soundType as any || 'gentle');
      }

      if (reminder.vibration && shouldVibrate() && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(reminder.title, {
          body: `Time for: ${reminder.title}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: reminder.id,
          renotify: true
        });
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [shouldPlaySound, shouldVibrate]);

  useEffect(() => {
    const checkReminders = async () => {
      const now = new Date();
      
      for (const reminder of reminders) {
        if (reminder.time <= now && !activeReminders.includes(reminder.id)) {
          await showNotification(reminder);
          setActiveReminders(prev => [...prev, reminder.id]);
        }
      }
    };

    const interval = setInterval(checkReminders, 1000);
    return () => clearInterval(interval);
  }, [reminders, activeReminders, showNotification]);

  const addReminder = useCallback((reminder: Reminder) => {
    if (!(reminder.time instanceof Date) || isNaN(reminder.time.getTime())) {
      console.error('Invalid reminder time:', reminder.time);
      return;
    }
    setReminders(prev => [...prev, reminder]);
  }, []);

  const removeReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    setActiveReminders(prev => prev.filter(r => r !== id));
  }, []);

  const getRemainingTime = useCallback((time: Date) => {
    const diff = time.getTime() - Date.now();
    if (diff <= 0) return 'Now';
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `in ${minutes} minutes`;
    
    const hours = Math.floor(minutes / 60);
    return `at ${time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }, []);

  return {
    reminders,
    activeReminders,
    addReminder,
    removeReminder,
    getRemainingTime
  };
};