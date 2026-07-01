import type { ColumnDef } from "@tanstack/react-table";
import { ModelVnSyncLog, SyncStatus } from "../lib/modelsVn.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type ModelVnSyncLogsColumn = ColumnDef<ModelVnSyncLog>;

interface Props {
  onViewPayload: (log: ModelVnSyncLog) => void;
  onRetry: (log: ModelVnSyncLog) => void;
  retryingId: number | null;
}

const STATUS_CONFIG: Record<
  SyncStatus,
  { label: string; className: string }
> = {
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

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: es });
}

export const modelVnSyncLogsColumns = ({
  onViewPayload,
  onRetry,
  retryingId,
}: Props): ModelVnSyncLogsColumn[] => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-sm">
        {(getValue() as string) || "—"}
      </span>
    ),
  },
  {
    id: "version",
    header: "Versión",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.model?.version ?? "—"}</span>
    ),
  },
  {
    id: "model_year",
    header: "Año",
    cell: ({ row }) => row.original.model?.model_year ?? "—",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as SyncStatus;
      const config = STATUS_CONFIG[status] ?? {
        label: status,
        className: "",
      };
      return (
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "attempts",
    header: "Intentos",
    cell: ({ getValue }) => (
      <span className="text-center block">{getValue() as number}</span>
    ),
  },
  {
    accessorKey: "last_attempt_at",
    header: "Último intento",
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">
        {formatDate(getValue() as string | null)}
      </span>
    ),
  },
  {
    accessorKey: "completed_at",
    header: "Completado",
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">
        {formatDate(getValue() as string | null)}
      </span>
    ),
  },
  {
    accessorKey: "error_message",
    header: "Error",
    cell: ({ getValue }) => {
      const msg = getValue() as string | null;
      if (!msg) return <span className="text-muted-foreground">—</span>;
      return (
        <span
          className="text-xs text-red-600 max-w-[200px] block truncate"
          title={msg}
        >
          {msg}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const log = row.original;
      return (
        <div className="flex items-center gap-1">
          {log.status === "completed" && log.dynamics_payload && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewPayload(log)}
              title="Ver payload"
            >
              <Eye className="size-4" />
            </Button>
          )}
          {log.status === "failed" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRetry(log)}
              disabled={retryingId === log.id}
              title="Reintentar"
            >
              <RefreshCw
                className={`size-4 ${retryingId === log.id ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>
      );
    },
  },
];
