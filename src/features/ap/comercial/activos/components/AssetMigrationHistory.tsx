"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge, BadgeColor } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Database,
  Loader2,
  FileClock,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DetailSheetTable } from "@/shared/components/DetailSheetTable";
import MigrationStatusBadge from "@/features/ap/facturacion/electronic-documents/components/MigrationStatusBadge";
import { getAssetMigrationLogs } from "../lib/assets.actions";
import { AssetMigrationLog } from "../lib/assets.interface";

interface Props {
  assetId: number;
}

const statusColor = (status: string): BadgeColor => {
  const map: Record<string, BadgeColor> = {
    pending: "yellow",
    in_progress: "blue",
    completed: "green",
    failed: "red",
  };
  return map[status] || "gray";
};

const statusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-blue-600" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  try {
    return format(new Date(value), "dd/MM/yyyy HH:mm:ss", { locale: es });
  } catch {
    return value;
  }
};

export default function AssetMigrationHistory({ assetId }: Props) {
  const [open, setOpen] = useState(false);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["assetMigrationLogs", assetId],
    queryFn: () => getAssetMigrationLogs(assetId),
    enabled: open,
  });

  const logs = useMemo(() => data?.logs ?? [], [data?.logs]);

  const logColumns = [
    {
      header: "Paso",
      render: (log: AssetMigrationLog) => (
        <div className="flex items-center gap-2">
          {statusIcon(log.status)}
          <div>
            <p className="font-medium">{log.step_name}</p>
            <p className="text-xs text-muted-foreground">{log.step}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Tabla",
      render: (log: AssetMigrationLog) => (
        <div className="flex items-center gap-1">
          <Database className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-mono">{log.table_name}</span>
        </div>
      ),
    },
    {
      header: "ID Externo",
      render: (log: AssetMigrationLog) => (
        <span className="text-xs font-mono">{log.external_id}</span>
      ),
    },
    {
      header: "Estado",
      render: (log: AssetMigrationLog) => (
        <Badge color={statusColor(log.status)}>{log.status_name}</Badge>
      ),
    },
    {
      header: "Proceso",
      render: (log: AssetMigrationLog) => (
        <span className="text-xs">{log.proceso_estado_name ?? "-"}</span>
      ),
    },
    {
      header: "Intentos",
      render: (log: AssetMigrationLog) => (
        <Badge variant="outline">{log.attempts}</Badge>
      ),
    },
    {
      header: "Completado",
      className: "text-xs",
      render: (log: AssetMigrationLog) => formatDate(log.completed_at),
    },
  ];

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        tooltip="Ver historial de migración"
        onClick={() => setOpen(true)}
      >
        <FileClock className="size-4" />
      </Button>

      <GeneralSheet
        open={open}
        onClose={() => setOpen(false)}
        icon="FileClock"
        title="Historial de Migración"
        subtitle="Historial detallado del proceso de migración del activo a Dynamics"
        size="7xl"
      >
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Actualizar
          </Button>
        </div>

        {isFetching && !data ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : data ? (
          <Tabs defaultValue="resumen" className="mt-4">
            <TabsList>
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="timeline">Línea de Tiempo</TabsTrigger>
            </TabsList>

            <TabsContent value="resumen" className="space-y-4">
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {data.asset.transaction_id}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {data.asset.vin ?? "-"}
                      {data.asset.plate ? ` · ${data.asset.plate}` : ""}
                    </p>
                  </div>
                  <MigrationStatusBadge
                    migration_status={data.asset.migration_status}
                  />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Responsable</p>
                    <p className="font-medium">{data.asset.worker ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fecha asignación</p>
                    <p className="font-medium">
                      {data.asset.assigned_date ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Transacción Dynamics</p>
                    <p className="font-medium">{data.asset.dyn_series ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Creado</p>
                    <p className="font-medium">
                      {formatDate(data.asset.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-360px)]">
                <DetailSheetTable
                  rows={logs}
                  columns={logColumns}
                  getKey={(log) => log.id}
                />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="ml-4 border-l-2 border-gray-200 pl-4 space-y-4 pt-2">
                  {logs.map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-[1.6rem] top-1 bg-background">
                        {statusIcon(log.status)}
                      </div>
                      <div className="rounded-lg border bg-card p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{log.step_name}</p>
                          <Badge color={statusColor(log.status)}>
                            {log.status_name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDate(
                              log.completed_at ??
                                log.last_attempt_at ??
                                log.created_at,
                            )}
                          </span>
                          <span>· Intentos: {log.attempts}</span>
                        </div>
                        {log.error_message && (
                          <div className="rounded bg-red-50 p-2 text-xs text-red-800">
                            <p className="font-medium">Error:</p>
                            <p>{log.error_message}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Sin datos de migración.
          </p>
        )}
      </GeneralSheet>
    </>
  );
}
