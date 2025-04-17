import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
          wellness: ['./src/pages/WellnessHub.tsx', './src/pages/SleepTracker.tsx', './src/pages/WellnessJournal.tsx'],
          health: ['./src/pages/PCOSTracker.tsx', './src/pages/PostpartumHub.tsx']
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild'
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});