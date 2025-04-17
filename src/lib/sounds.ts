// Sound types with their oscillator configurations
export const SOUND_TYPES = {
  gentle: {
    type: 'sine',
    frequency: 440,
    duration: 200,
    gain: 0.1,
    pattern: [1]
  },
  chime: {
    type: 'sine',
    frequency: 880,
    duration: 150,
    gain: 0.1,
    pattern: [1, 0.5, 1]
  },
  alert: {
    type: 'square',
    frequency: 660,
    duration: 100,
    gain: 0.08,
    pattern: [1, 1, 1]
  },
  soft: {
    type: 'triangle',
    frequency: 520,
    duration: 300,
    gain: 0.12,
    pattern: [1]
  },
  bell: {
    type: 'sine',
    frequency: 784,
    duration: 200,
    gain: 0.1,
    pattern: [1, 0.7, 0.4]
  }
} as const;

export type SoundType = keyof typeof SOUND_TYPES;

let audioContext: AudioContext | null = null;

// Initialize audio context with user interaction
export const initializeAudio = async (): Promise<void> => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
  } catch (error) {
    console.error('Failed to initialize audio context:', error);
  }
};

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const createOscillator = (config: typeof SOUND_TYPES[SoundType], volume: number = 1) => {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  oscillator.type = config.type as OscillatorType;
  oscillator.frequency.setValueAtTime(config.frequency, context.currentTime);
  gainNode.gain.setValueAtTime(0, context.currentTime);
  
  return { oscillator, gainNode };
};

export const playNotificationSound = async (
  soundType: SoundType = 'gentle',
  volume: number = 1
): Promise<void> => {
  try {
    await initializeAudio();
    
    const config = SOUND_TYPES[soundType];
    const context = getAudioContext();
    let startTime = context.currentTime;
    let lastOscillatorEnd = startTime;
    
    // Clamp volume between 0 and 1
    const safeVolume = Math.min(Math.max(volume, 0), 1);
    
    const playPromises = config.pattern.map((patternVolume, index) => {
      return new Promise<void>(resolve => {
        const { oscillator, gainNode } = createOscillator(config);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(
          config.gain * patternVolume * safeVolume,
          startTime + 0.01
        );
        gainNode.gain.linearRampToValueAtTime(
          0,
          startTime + (config.duration / 1000)
        );
        
        oscillator.start(startTime);
        oscillator.stop(startTime + (config.duration / 1000));
        
        lastOscillatorEnd = startTime + (config.duration / 1000);
        startTime += (config.duration / 1000);
        
        oscillator.onended = () => resolve();
      });
    });
    
    await Promise.all(playPromises);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Clean up function to close audio context when needed
export const cleanup = () => {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};