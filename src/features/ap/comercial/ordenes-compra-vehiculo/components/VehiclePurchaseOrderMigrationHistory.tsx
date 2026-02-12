"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw,
  FileClock,
} from "lucide-react";
import {
  getMigrationLogs,
  getMigrationHistory,
} from "../lib/vehiclePurchaseOrder.actions";
import { MigrationLog } from "../lib/vehiclePurchaseOrder.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DataTable } from "@/shared/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";

interface VehiclePurchaseOrderMigrationHistoryProps {
  purchaseOrderId: number;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "in_progress":
      return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "updated_with_nc":
      return <CheckCircle2 className="h-4 w-4 text-purple-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }
};

const getNameStatus = (status: string) => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "in_progress":
      return "En Proceso";
    case "completed":
      return "Completado";
    case "failed":
      return "Fallido";
    case "updated_with_nc":
      return "Actualizado con NC";
    default:
      return status;
  }
};

const getStatusBadge = (status: string, statusName?: string) => {
  const variants: Record<string, { bg: string; text: string; hover: string }> =
    {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        hover: "hover:bg-yellow-200",
      },
      in_progress: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        hover: "hover:bg-blue-200",
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        hover: "hover:bg-green-200",
      },
      failed: {
        bg: "bg-red-100",
        text: "text-red-800",
        hover: "hover:bg-red-200",
      },
      updated_with_nc: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        hover: "hover:bg-purple-200",
      },
    };

  const variant = variants[status] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    hover: "hover:bg-gray-200",
  };

  return (
    <Badge className={cn(variant.bg, variant.text, variant.hover, "border-0")}>
      {statusName || status}
    </Badge>
  );
};

const getProcesoEstadoBadge = (
  procesoEstado: number,
  procesoEstadoName: string,
) => {
  const variants: Record<number, { bg: string; text: string; hover: string }> =
    {
      1: {
        bg: "bg-green-100",
        text: "text-green-800",
        hover: "hover:bg-green-200",
      },
      2: { bg: "bg-red-100", text: "text-red-800", hover: "hover:bg-red-200" },
      0: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        hover: "hover:bg-yellow-200",
      },
    };

  const variant = variants[procesoEstado] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    hover: "hover:bg-gray-200",
  };

  return (
    <Badge className={cn(variant.bg, variant.text, variant.hover, "border-0")}>
      {procesoEstadoName}
    </Badge>
  );
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", {
      locale: es,
    });
  } catch {
    return dateString;
  }
};

const migrationLogsColumns: ColumnDef<MigrationLog>[] = [
  {
    accessorKey: "step",
    header: "Paso",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {getStatusIcon(row.original.status)}
        <div>
          <p className="font-medium">{row.original.step_name}</p>
          <p className="text-xs text-muted-foreground">{row.original.step}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "table_name",
    header: "Tabla",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Database className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs font-mono">{row.original.table_name}</span>
      </div>
    ),
  },
  {
    accessorKey: "external_id",
    header: "ID Externo",
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.original.external_id}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) =>
      getStatusBadge(row.original.status, row.original.status_name),
  },
  {
    accessorKey: "proceso_estado",
    header: "Proceso",
    cell: ({ row }) =>
      getProcesoEstadoBadge(
        row.original.proceso_estado,
        row.original.proceso_estado_name,
      ),
  },
  {
    accessorKey: "attempts",
    header: "Intentos",
    cell: ({ row }) => <Badge variant="outline">{row.original.attempts}</Badge>,
  },
  {
    accessorKey: "completed_at",
    header: "Completado",
    cell: ({ row }) => (
      <span className="text-xs">
        {row.original.completed_at
          ? formatDate(row.original.completed_at)
          : "-"}
      </span>
    ),
  },
];

const getEventIcon = (event: string) => {
  switch (event) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "attempt":
      return <Clock className="h-5 w-5 text-blue-600" />;
    case "created":
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
  }
};

export default function VehiclePurchaseOrderMigrationHistory({
  purchaseOrderId,
}: VehiclePurchaseOrderMigrationHistoryProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: logsData, isFetching: isLoadingLogs } = useQuery({
    queryKey: ["vehiclePurchaseOrderMigrationLogs", purchaseOrderId],
    queryFn: () => getMigrationLogs(purchaseOrderId),
    enabled: open,
  });

  const { data: historyData, isFetching: isLoadingHistory } = useQuery({
    queryKey: ["vehiclePurchaseOrderMigrationHistory", purchaseOrderId],
    queryFn: () => getMigrationHistory(purchaseOrderId),
    enabled: open,
  });

  const logsTableData = useMemo(
    () => logsData?.data.logs ?? [],
    [logsData?.data.logs],
  );

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["vehiclePurchaseOrderMigrationLogs", purchaseOrderId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["vehiclePurchaseOrderMigrationHistory", purchaseOrderId],
      }),
    ]);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        tooltip="Ver Historial de Migración"
        onClick={() => setOpen(true)}
      >
        <FileClock className="size-4" />
      </Button>

      <GeneralSheet
        open={open}
        onClose={() => setOpen(false)}
        icon="FileClock"
        title="Historial de Migración"
        subtitle="Historial detallado del proceso de migración de la orden de compra"
        size="7xl"
      >
        {isLoadingLogs || isLoadingHistory ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Tabs defaultValue="resumen">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="resumen">Resumen</TabsTrigger>
                <TabsTrigger value="timeline">Línea de Tiempo</TabsTrigger>
              </TabsList>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  color="primary"
                  onClick={handleRefresh}
                  disabled={isLoadingLogs || isLoadingHistory}
                  className="gap-2"
                >
                  <RefreshCw
                    className={cn(
                      "h-4 w-4",
                      (isLoadingLogs || isLoadingHistory) && "animate-spin",
                    )}
                  />
                  Actualizar
                </Button>
              </div>
            </div>

            <TabsContent value="resumen" className="space-y-4">
              {logsData && (
                <>
                  {/* Header Info */}
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {logsData.data.purchase_order.number}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Guía: {logsData.data.purchase_order.number_guide}
                        </p>
                      </div>
                      {getStatusBadge(
                        logsData.data.purchase_order.migration_status,
                        getNameStatus(
                          logsData.data.purchase_order.migration_status,
                        ),
                      )}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Creado</p>
                        <p className="font-medium">
                          {formatDate(logsData.data.purchase_order.created_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Migrado</p>
                        <p className="font-medium">
                          {formatDate(logsData.data.purchase_order.migrated_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logs Table */}
                  <DataTable
                    columns={migrationLogsColumns}
                    data={logsTableData}
                    variant="simple"
                    isVisibleColumnFilter={false}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              {historyData && (
                <>
                  {/* Header Info */}
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {historyData.data.purchase_order.number}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Guía: {historyData.data.purchase_order.number_guide}
                        </p>
                      </div>
                      {getStatusBadge(
                        historyData.data.purchase_order.migration_status,
                        historyData.data.purchase_order.migration_status ===
                          "completed"
                          ? "Completado"
                          : "Pendiente",
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="space-y-8">
                      {historyData.data.timeline.map(
                        (timelineStep, stepIndex) => (
                          <div key={stepIndex} className="relative">
                            <div className="sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-10 pb-2">
                              <h4 className="font-semibold text-sm">
                                {timelineStep.step_name || timelineStep.step}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {timelineStep.step}
                              </p>
                            </div>

                            <div className="ml-4 border-l-2 border-gray-200 pl-4 space-y-4 pt-2">
                              {timelineStep.events.map((event, eventIndex) => (
                                <div key={eventIndex} className="relative">
                                  <div className="absolute -left-[1.6rem] top-1 bg-background">
                                    {getEventIcon(event.event)}
                                  </div>
                                  <div className="rounded-lg border bg-card p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium text-sm">
                                        {event.description}
                                      </p>
                                      {getStatusBadge(event.status)}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>{formatDate(event.timestamp)}</span>
                                    </div>
                                    {event.error && (
                                      <div className="rounded bg-red-50 p-2 text-xs text-red-800">
                                        <p className="font-medium">Error:</p>
                                        <p>{event.error}</p>
                                      </div>
                                    )}
                                    {event.proceso_estado !== undefined && (
                                      <div className="pt-1">
                                        {getProcesoEstadoBadge(
                                          event.proceso_estado,
                                          event.proceso_estado === 1
                                            ? "Procesado Exitosamente"
                                            : "Error",
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </ScrollArea>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </GeneralSheet>
    </>
  );
}
