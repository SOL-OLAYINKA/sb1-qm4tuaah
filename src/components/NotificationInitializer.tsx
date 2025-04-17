import React, { useEffect, useCallback } from 'react';
import { initializeAudio } from '../lib/sounds';
import { useNotificationSettings } from '../lib/useNotificationSettings';

export const NotificationInitializer: React.FC = () => {
  const { settings } = useNotificationSettings();

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }, []);

  const initializeNotifications = useCallback(async () => {
    try {
      // Initialize audio context
      await initializeAudio();
      
      // Request notification permissions if enabled in settings
      if (settings.notificationsEnabled) {
        await requestNotificationPermission();
      }

      // Initialize vibration if available
      if (settings.vibrationEnabled && !('vibrate' in navigator)) {
        console.log('Vibration not supported');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }, [settings, requestNotificationPermission]);

  useEffect(() => {
    initializeNotifications();

    // Add click event listener to initialize audio on first user interaction
    const handleFirstInteraction = async () => {
      await initializeAudio();
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, [initializeNotifications]);

  return null;
};