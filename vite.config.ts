import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
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
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/") || id.includes("node_modules/react-router")) return "vendor";
          if (id.includes("node_modules/@radix-ui")) return "ui";
          if (id.includes("node_modules/framer-motion")) return "animations";
          if (id.includes("node_modules/recharts") || id.includes("node_modules/date-fns")) return "charts";
          if (id.includes("node_modules/@supabase")) return "supabase";
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
