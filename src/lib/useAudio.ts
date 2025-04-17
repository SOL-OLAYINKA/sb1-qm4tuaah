import { useEffect, useCallback } from 'react';
import { initializeAudio, playNotificationSound, type SoundType } from './sounds';
import { useNotificationSettings } from './useNotificationSettings';

export const useAudio = () => {
  const { settings, shouldPlaySound } = useNotificationSettings();

  useEffect(() => {
    // Initialize audio context when component mounts
    initializeAudio();
  }, []);

  const playSound = useCallback(async (soundType?: SoundType) => {
    if (!shouldPlaySound()) return;

    try {
      await playNotificationSound(
        soundType || settings.defaultSoundType,
        settings.notificationVolume
      );
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }, [settings.defaultSoundType, settings.notificationVolume, shouldPlaySound]);

  return { playSound };
};