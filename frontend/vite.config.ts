import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This is needed for Docker
    watch: {
      usePolling: true, // This is important for Docker on some systems
    },
  },
});
