import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    minify: "esbuild",
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/") || id.includes("node_modules/react-router") || id.includes("node_modules/recharts") || id.includes("node_modules/date-fns")) return "vendor";
          if (id.includes("node_modules/@radix-ui")) return "ui";
          if (id.includes("node_modules/framer-motion")) return "animations";
          if (id.includes("node_modules/@supabase")) return "supabase";
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
