import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";
import { ReactQueryProvider } from "./providers/ReactQueryProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// Importa los pesos que necesitas
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";

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
