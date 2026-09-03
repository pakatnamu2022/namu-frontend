"use client";

import { Button } from "@/components/ui/button";
import { Home, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <SearchX className="h-12 w-12 text-muted-foreground" />
        </div>

        <p className="text-sm font-semibold text-primary">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Página no encontrada
        </h1>
        <p className="mt-3 text-muted-foreground">
          La página que buscas no existe, fue movida o no tienes acceso a
          ella.
        </p>

        <div className="mt-8">
          <Button
            onClick={() => navigate("/companies")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
