
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
  },
  plugins: [
    react(), // Just the react plugin
  ], // No need for .filter(Boolean) if it's just react()
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Force resolution to ensure secure versions
  optimizeDeps: {
    force: true,
  },
}));
