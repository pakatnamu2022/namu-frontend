import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "data-vendor": ["@tanstack/react-query", "@tanstack/react-table", "@tanstack/react-virtual", "axios", "zustand", "jotai"],
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
          "ui-vendor": ["radix-ui", "cmdk", "vaul", "sonner", "embla-carousel-react", "class-variance-authority", "tailwind-merge", "clsx"],
          icons: ["lucide-react"],
          "markdown-vendor": ["react-markdown", "remark-gfm", "rehype-raw"],
          charts: ["recharts"],
          maps: ["leaflet", "react-leaflet"],
          flow: ["@xyflow/react", "@dagrejs/dagre"],
          motion: ["motion"],
          "date-vendor": ["date-fns", "date-fns-tz"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: [
      "sian.grupopakatnamu.com",
      "sian-test.grupopakatnamu.com",
      "localhost",
      "127.0.0.1",
    ],
  },
});
