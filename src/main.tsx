import "leaflet/dist/leaflet.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";
import { ReactQueryProvider } from "./providers/ReactQueryProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// Importa los pesos que necesitas
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('[PWA] Service Worker registrado correctamente');
        try {
          const periodicSync = (registration as any).periodicSync;
          if (periodicSync && 'permissions' in navigator) {
            periodicSync.register('location-sync', {
              minInterval: 15 * 60 * 1000
            }).then(() => {
              console.log('[PWA] Periodic sync registrado (opcional)');
            }).catch((err: Error) => {
              // Esto es normal, muchos navegadores no soportan periodicSync
              console.log('[PWA] Periodic sync no soportado:', err.message);
            });
          }
        } catch (err) {
          console.log('[PWA] Periodic sync no disponible');
        }
      })
      .catch(error => {
        console.log('[PWA] Error registrando Service Worker:', error);
      });
  });
}

if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <ReactQueryProvider>
        <App />
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </ReactQueryProvider>
    </ThemeProvider>
  </StrictMode>
);
