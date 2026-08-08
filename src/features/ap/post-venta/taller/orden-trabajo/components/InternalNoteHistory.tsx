import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge, BadgeColor } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DetailSheetTable } from "@/shared/components/DetailSheetTable";
import { errorToast, successToast } from "@/core/core.function";
import { WORKER_ORDER } from "../lib/workOrder.constants";
import { getInternalNoteLogs } from "../lib/workOrder.actions";
import { verifyInternalNoteMigration } from "../../notas-internas/lib/internalNoteMigration.actions";

interface InternalNoteHistoryProps {
  workOrderId: number;
}

export default function InternalNoteHistory({
  workOrderId,
}: InternalNoteHistoryProps) {
  const { ICON } = WORKER_ORDER;
  const [open, setOpen] = useState(false);

  const {
    data: logsData,
    isLoading: isLoadingLogs,
    isFetching: isFetchingLogs,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ["internalNoteLogs", workOrderId],
    queryFn: () => getInternalNoteLogs(workOrderId),
    enabled: open,
  });

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

  const getStatusBadge = (status: string, statusName?: string) => {
    const variants: Record<string, BadgeColor> = {
      pending: "yellow",
      in_progress: "blue",
      completed: "green",
      failed: "red",
      updated_with_nc: "purple",
    };

    const variant = variants[status] || "gray";

    return <Badge color={variant}>{statusName || status}</Badge>;
  };

  const getProcesoEstadoBadge = (
    procesoEstado: number,
    procesoEstadoName: string,
  ) => {
    const variants: Record<
      number,
      { bg: string; text: string; hover: string }
    > = {
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
      <Badge
        className={cn(variant.bg, variant.text, variant.hover, "border-0")}
      >
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

  const logs = logsData?.data?.logs ?? [];

  const timeline = useMemo(() => {
    const stepsMap = new Map<
      string,
      { step: string; step_name: string; events: any[] }
    >();

    for (const log of logs) {
      const key = log.step ?? log.step_name;
      if (!stepsMap.has(key)) {
        stepsMap.set(key, {
          step: log.step,
          step_name: log.step_name,
          events: [],
        });
      }
      stepsMap.get(key)!.events.push(log);
    }

    return Array.from(stepsMap.values());
  }, [logs]);

  const handleRefresh = async () => {
    await refetchLogs();
  };

  const { mutateAsync: verifyMigration, isPending: isVerifyingMigration } =
    useMutation({
      mutationFn: () => verifyInternalNoteMigration(workOrderId),
    });

  const handleVerifyMigration = async () => {
    try {
      await verifyMigration();
      successToast("Verificación de migración ejecutada exitosamente");
      await refetchLogs();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Error al verificar la migración de la nota interna";
      errorToast(message);
    }
  };

  const logColumns = [
    {
      header: "Paso",
      render: (log: any) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(log.status)}
          <div>
            <p className="font-medium">{log.step_name}</p>
            <p className="text-xs text-muted-foreground">{log.step}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Tabla",
      render: (log: any) => (
        <div className="flex items-center gap-1">
          <Database className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-mono">{log.table_name}</span>
        </div>
      ),
    },
    {
      header: "ID Externo",
      render: (log: any) => (
        <span className="text-xs font-mono">{log.external_id}</span>
      ),
    },
    {
      header: "Estado",
      render: (log: any) => getStatusBadge(log.status, log.status_name),
    },
    {
      header: "Proceso",
      render: (log: any) =>
        getProcesoEstadoBadge(log.proceso_estado, log.proceso_estado_name),
    },
    {
      header: "Intentos",
      render: (log: any) => <Badge variant="outline">{log.attempts}</Badge>,
    },
    {
      header: "Completado",
      className: "text-xs",
      render: (log: any) =>
        log.completed_at ? formatDate(log.completed_at) : "-",
    },
  ];

  return (
    <div>
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        tooltip="Ver historial de nota interna"
        onClick={() => setOpen(true)}
      >
        <FileClock className="size-4" />
      </Button>

      <GeneralSheet
        title="Historial de Nota Interna"
        subtitle="Historial detallado del proceso de migración de la nota interna"
        open={open}
        onClose={() => setOpen(false)}
        icon={ICON}
        size="7xl"
      >
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVerifyMigration}
            disabled={isVerifyingMigration || isFetchingLogs}
            className="gap-2"
          >
            {isVerifyingMigration ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Verificar Migración
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetchingLogs}
            className="gap-2"
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetchingLogs && "animate-spin")}
            />
            Actualizar
          </Button>
        </div>

        {isLoadingLogs ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Tabs defaultValue="resumen" className="mt-4">
            <TabsList>
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="timeline">Línea de Tiempo</TabsTrigger>
            </TabsList>

            <TabsContent value="resumen" className="space-y-4">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <DetailSheetTable
                  rows={logs}
                  columns={logColumns}
                  getKey={(log) => log.id}
                />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-8">
                  {timeline.map((timelineStep, stepIndex: number) => (
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
                        {timelineStep.events.map(
                          (event: any, eventIndex: number) => (
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
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </GeneralSheet>
    </div>
  );
}
