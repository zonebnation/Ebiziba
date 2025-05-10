import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          framer: ['framer-motion'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-avatar', '@radix-ui/react-scroll-area'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true
  },
  envDir: '.',
  // Exclude Quran pages from the build
  publicDir: 'public',
  define: {
    'process.env.IPFS_QURAN_CID': JSON.stringify('bafybeiew2vzukjtjlrx5ofgftuesvzm3pvsqajiupxv2cgnyoagfuhrkyi')
  }
});
