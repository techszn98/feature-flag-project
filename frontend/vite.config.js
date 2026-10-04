import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const apiOrigin = new URL(env.VITE_API_URL || "http://localhost:3000/api/v1")
    .origin;

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      allowedHosts: [".onrender.com"],
      proxy: {
        "/api/v1": {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
    preview: {
      allowedHosts: [".onrender.com"],
    },
  };
});