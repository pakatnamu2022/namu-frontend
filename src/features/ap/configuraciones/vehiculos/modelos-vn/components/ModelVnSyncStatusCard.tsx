"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { RefreshCw, History } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { useModelVnSyncLogs } from "../lib/modelsVn.hook";
import { syncModelVn } from "../lib/modelsVn.actions";
import { SyncStatus } from "../lib/modelsVn.interface";
import { errorToast, successToast } from "@/core/core.function";
import { MODELS_VN } from "../lib/modelsVn.constanst";
import ModelVnDynamicsSheet from "./ModelVnDynamicsSheet";

interface Props {
  modelId: number;
}

const STATUS_CONFIG: Record<SyncStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Pendiente",
      className: "bg-gray-100 text-gray-600 hover:bg-gray-100",
    },
    in_progress: {
      label: "En proceso",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    },
    completed: {
      label: "Completado",
      className: "bg-green-100 text-green-700 hover:bg-green-100",
    },
    failed: {
      label: "Fallido",
      className: "bg-red-100 text-red-700 hover:bg-red-100",
    },
  };

export default function ModelVnSyncStatusCard({ modelId }: Props) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const queryClient = useQueryClient();
  const { QUERY_KEY } = MODELS_VN;

  const { data, refetch } = useModelVnSyncLogs({
    model_id: modelId,
    per_page: 1,
  });

  const latest = data?.data?.[0] ?? null;
  const config = latest
    ? (STATUS_CONFIG[latest.status] ?? { label: latest.status, className: "" })
    : null;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncModelVn(modelId);
      successToast("Sincronización iniciada.");
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "sync-logs"] });
      await refetch();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al iniciar la sincronización.";
      errorToast(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="rounded-xl shadow-sm bg-card p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Dynamics
          </span>
          {latest && config ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={config.className}>
                {config.label}
              </Badge>
              {latest.last_attempt_at && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(latest.last_attempt_at), "dd/MM/yyyy HH:mm", {
                    locale: es,
                  })}
                </span>
              )}
              {latest.error_message && (
                <span
                  className="text-xs text-red-600 truncate max-w-[220px]"
                  title={latest.error_message}
                >
                  {latest.error_message}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Sin registros</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing || latest?.status === "in_progress"}
            >
              <RefreshCw className={`size-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Sincronizando..." : "Sincronizar"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Enviar a Dynamics</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setHistoryOpen(true)}
            >
              <History className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ver historial completo</TooltipContent>
        </Tooltip>
      </div>

      <ModelVnDynamicsSheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        modelId={modelId}
      />
    </div>
  );
}
