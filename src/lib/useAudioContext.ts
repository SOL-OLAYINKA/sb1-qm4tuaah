let audioContext: AudioContext | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const initializeAudioContext = async (): Promise<void> => {
  const context = getAudioContext();
  if (context.state === 'suspended') {
    await context.resume();
  }
};

export const cleanupAudioContext = (): void => {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};