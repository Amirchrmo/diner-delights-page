import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Pass --base=/admin/ for production builds served at https://bergeerd.ir/admin/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
