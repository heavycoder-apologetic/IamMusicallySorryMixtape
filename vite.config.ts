import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The site is served from a GitHub Pages subpath in production:
//   https://heavycoder-apologetic.github.io/IamMusicallySorryMixtape/
// In dev we serve from the root so localhost:5173/ keeps working.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/IamMusicallySorryMixtape/' : '/',
  plugins: [react()],
  server: { port: 5173, open: true },
}));
