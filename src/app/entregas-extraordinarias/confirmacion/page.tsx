"use client";

import { useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function EntregaExtraordinariaConfirmacionPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const id = searchParams.get("id");
  const message = searchParams.get("message");

  const content = (() => {
    switch (status) {
      case "approved":
        return {
          icon: (
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          ),
          title: "Entrega extraordinaria aprobada",
          description: id
            ? `La entrega #${id} fue aprobada correctamente.`
            : "La entrega fue aprobada correctamente.",
          titleClass: "text-green-700",
        };
      case "already_approved":
        return {
          icon: (
            <div className="bg-orange-100 rounded-full p-4">
              <AlertTriangle className="h-10 w-10 text-orange-500" />
            </div>
          ),
          title: "Esta entrega ya fue aprobada",
          description: id
            ? `La entrega #${id} ya había sido aprobada anteriormente.`
            : "Esta entrega ya había sido aprobada anteriormente.",
          titleClass: "text-orange-700",
        };
      case "error":
      default:
        return {
          icon: (
            <div className="bg-red-100 rounded-full p-4">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          ),
          title: "No se pudo procesar la solicitud",
          description:
            message || "Ocurrió un error al procesar la aprobación. Intente nuevamente o contacte a soporte.",
          titleClass: "text-red-700",
        };
    }
  })();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50/30 dark:from-background/10 dark:to-background/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-1 mb-6">
          <p className="text-muted-foreground text-sm">
            Grupo Pakatnamu — Comercial
          </p>
        </div>

        <div className="bg-white dark:bg-background shadow-sm rounded-xl p-8 text-center space-y-4">
          <div className="flex justify-center">{content.icon}</div>
          <h1 className={`text-xl font-semibold ${content.titleClass}`}>
            {content.title}
          </h1>
          <p className="text-muted-foreground text-sm">{content.description}</p>
        </div>
      </div>
    </div>
  );
}
