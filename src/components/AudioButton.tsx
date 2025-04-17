import React, { useCallback, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { playNotificationSound, initializeAudio, type SoundType } from '../lib/sounds';

interface AudioButtonProps {
  soundType?: SoundType;
  volume?: number;
  className?: string;
  onClick?: () => void;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  soundType = 'gentle',
  volume = 1,
  className = '',
  onClick
}) => {
  // Initialize audio context on mount
  useEffect(() => {
    initializeAudio();
  }, []);

  const handleClick = useCallback(async () => {
    try {
      await playNotificationSound(soundType, volume);
      onClick?.();
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }, [soundType, volume, onClick]);

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
      title="Play sound"
    >
      <Volume2 className="w-5 h-5" />
    </button>
  );
};