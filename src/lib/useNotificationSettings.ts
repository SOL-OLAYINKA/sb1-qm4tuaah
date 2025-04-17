import { useState, useEffect } from 'react';
import { SoundType } from './sounds';

export type NotificationSettings = {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  defaultSoundType: SoundType;
  remindersEnabled: boolean;
  sleepAlertsEnabled: boolean;
  cycleAlertsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  notificationVolume: number;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  notificationsEnabled: true,
  defaultSoundType: 'gentle',
  remindersEnabled: true,
  sleepAlertsEnabled: true,
  cycleAlertsEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  notificationVolume: 0.5
};

const STORAGE_KEY = 'notification_settings';

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }, [settings]);

  const isQuietHours = (): boolean => {
    if (!settings.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHours, startMinutes] = settings.quietHoursStart.split(':').map(Number);
    const [endHours, endMinutes] = settings.quietHoursEnd.split(':').map(Number);
    
    const startTime = startHours * 60 + startMinutes;
    const endTime = endHours * 60 + endMinutes;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  const shouldPlaySound = (): boolean => {
    return settings.soundEnabled && !isQuietHours();
  };

  const shouldVibrate = (): boolean => {
    return settings.vibrationEnabled && !isQuietHours();
  };

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return {
    settings,
    updateSettings,
    isQuietHours,
    shouldPlaySound,
    shouldVibrate
  };
};