import { useState, useEffect } from 'react';
import { playNotificationSound, type SoundType } from './sounds';

export type SleepAlert = {
  id: string;
  type: 'bedtime' | 'wakeup';
  time: string;
  enabled: boolean;
  sound: boolean;
  soundType: SoundType;
  vibration: boolean;
};

const DEFAULT_ALERTS: SleepAlert[] = [
  {
    id: 'bedtime',
    type: 'bedtime',
    time: '22:00',
    enabled: true,
    sound: true,
    soundType: 'soft',
    vibration: true
  },
  {
    id: 'wakeup',
    type: 'wakeup',
    time: '07:00',
    enabled: true,
    sound: true,
    soundType: 'gentle',
    vibration: true
  }
];

export const useSleepAlerts = () => {
  const [alerts, setAlerts] = useState<SleepAlert[]>(() => {
    const savedAlerts = localStorage.getItem('sleepAlerts');
    return savedAlerts ? JSON.parse(savedAlerts) : DEFAULT_ALERTS;
  });

  useEffect(() => {
    localStorage.setItem('sleepAlerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      alerts.forEach(alert => {
        if (alert.enabled && alert.time === currentTime) {
          if (alert.sound) {
            playNotificationSound(alert.soundType);
          }
          if (alert.vibration && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
        }
      });
    };

    const interval = setInterval(checkAlerts, 1000);
    return () => clearInterval(interval);
  }, [alerts]);

  const toggleAlert = (id: string, field: keyof SleepAlert) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id
        ? { ...alert, [field]: !alert[field] }
        : alert
    ));
  };

  const updateAlertTime = (id: string, time: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id
        ? { ...alert, time }
        : alert
    ));
  };

  const updateAlertSound = (id: string, soundType: SoundType) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id
        ? { ...alert, soundType }
        : alert
    ));
  };

  return {
    alerts,
    toggleAlert,
    updateAlertTime,
    updateAlertSound
  };
};