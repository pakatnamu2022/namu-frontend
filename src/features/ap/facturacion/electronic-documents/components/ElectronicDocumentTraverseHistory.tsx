import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, CheckCircle2, AlertCircle, Loader2, FileClock, RefreshCw } from "lucide-react";
import { getTraverseHistory } from "../lib/electronicDocument.actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface ElectronicDocumentTraverseHistoryProps {
  electronicDocumentId: number;
}

export default function ElectronicDocumentTraverseHistory({
  electronicDocumentId,
}: ElectronicDocumentTraverseHistoryProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: historyData, isFetching: isLoadingHistory } = useQuery({
    queryKey: ["electronicDocumentTraverseHistory", electronicDocumentId],
    queryFn: () => getTraverseHistory(electronicDocumentId),
    enabled: open,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "yellow" | "blue" | "green" | "red" | "purple" | "gray"> = {
      pending: "yellow",
      in_progress: "blue",
      completed: "green",
      failed: "red",
      updated_with_nc: "purple",
    };

    return <Badge color={variants[status] || "gray"}>{status}</Badge>;
  };

  const getProcesoEstadoBadge = (procesoEstado: number, procesoEstadoName: string) => {
    const variants: Record<number, "yellow" | "blue" | "green" | "red" | "purple" | "gray"> = {
      1: "green",
      2: "red",
      0: "yellow",
    };

    return <Badge color={variants[procesoEstado] || "gray"}>{procesoEstadoName}</Badge>;
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

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["electronicDocumentTraverseHistory", electronicDocumentId],
    });
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
        subtitle="Historial detallado del proceso de migración de la travesía"
        size="7xl"
      >
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                color="primary"
                onClick={handleRefresh}
                disabled={isLoadingHistory}
                className="gap-2"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isLoadingHistory && "animate-spin")}
                />
                Actualizar
              </Button>
            </div>

            {historyData && (
              <>
                {/* Header Info */}
                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {historyData.electronic_document.full_number}
                      </h3>
                    </div>
                    {getStatusBadge(historyData.electronic_document.migration_status)}
                  </div>
                </div>

                {/* Timeline */}
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-8">
                    {historyData.timeline.map((timelineStep, stepIndex) => (
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
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        )}
      </GeneralSheet>
    </>
  );
}
