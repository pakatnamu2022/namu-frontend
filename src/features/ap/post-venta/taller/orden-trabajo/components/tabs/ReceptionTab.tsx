import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  ImageIcon,
  FileText,
  Expand,
  Ban,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CHECKLIST_ITEMS } from "@/features/ap/post-venta/taller/inspeccion-vehiculo/lib/vehicleInspection.constants";
import {
  DAMAGE_SYMBOLS,
  DAMAGE_COLORS,
} from "@/features/ap/post-venta/taller/inspeccion-vehiculo/lib/vehicleInspection.interface";
import {
  downloadVehicleInspectionPdf,
  requestCancellation,
  confirmCancellation,
} from "@/features/ap/post-venta/taller/inspeccion-vehiculo/lib/vehicleInspection.actions";
import { useState } from "react";
import { errorToast, successToast } from "@/core/core.function";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";

interface ReceptionTabProps {
  workOrderId: number;
}

export default function ReceptionTab({ workOrderId }: ReceptionTabProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const queryClient = useQueryClient();
  const router = useNavigate();

  const {
    data: workOrder,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: () => findWorkOrderById(workOrderId),
    retry: false,
  });

  const inspection = workOrder?.vehicle_inspection;

  const cancellationRequested =
    !!inspection?.cancellation_requested_at && !inspection?.is_cancelled;
  const isCancelled = !!inspection?.is_cancelled;

  const handleDownloadPdf = async () => {
    if (!inspection?.id) return;

    try {
      setIsDownloading(true);
      await downloadVehicleInspectionPdf(inspection.id);
      successToast("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      errorToast("Error al descargar el PDF de la inspección");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRequestCancellation = async () => {
    if (!inspection?.id || !cancellationReason.trim()) return;

    try {
      setIsCancelling(true);
      await requestCancellation(inspection.id, cancellationReason.trim());
      successToast("Solicitud de anulación enviada exitosamente");
      setDialogOpen(false);
      setCancellationReason("");
      queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] });
    } catch (error) {
      console.error("Error al solicitar anulación:", error);
      errorToast("Error al solicitar la anulación");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!inspection?.id) return;

    try {
      await confirmCancellation(inspection.id);
      successToast("Anulación confirmada exitosamente");
      setConfirmDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] });
    } catch (error) {
      console.error("Error al confirmar anulación:", error);
      errorToast("Error al confirmar la anulación");
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({
        queryKey: ["workOrder", workOrderId],
      });
      successToast("Información actualizada");
    } catch (error) {
      console.error("Error al actualizar:", error);
      errorToast("Error al actualizar la información");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-500">Cargando inspección de recepción...</p>
        </div>
      </Card>
    );
  }

  const hasInspection = !!inspection && !error;

  if (!hasInspection) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay inspección de recepción
          </h3>
          <p className="text-gray-500 mb-4">
            Esta orden de trabajo no tiene una inspección de vehículo registrada
          </p>
        </div>
      </Card>
    );
  }

  if (isCancelled) {
    return (
      <div className="grid gap-6">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-3 mb-4">
            <div className="rounded-full bg-red-100 p-2">
              <Ban className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                Inspección Anulada
              </h3>
              <p className="text-sm text-red-600 mt-0.5">
                Esta inspección de recepción ha sido anulada
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-red-200 p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Motivo de anulación</p>
                <p className="text-sm font-medium text-gray-800">
                  {inspection.cancellation_reason || "No especificado"}
                </p>
              </div>
            </div>

            <div className="border-t pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Solicitado por</p>
                <p className="text-sm font-medium text-gray-800">
                  {inspection.cancellation_requested_by_name || "N/A"}
                </p>
                <p className="text-xs text-gray-400">
                  {inspection.cancellation_requested_at
                    ? new Date(
                        inspection.cancellation_requested_at,
                      ).toLocaleString("es-PE")
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Confirmado por</p>
                <p className="text-sm font-medium text-gray-800">
                  {inspection.cancellation_confirmed_by_name || "N/A"}
                </p>
                <p className="text-xs text-gray-400">
                  {inspection.cancellation_confirmed_at
                    ? new Date(
                        inspection.cancellation_confirmed_at,
                      ).toLocaleString("es-PE")
                    : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Button
              onClick={() =>
                router(
                  `/ap/post-venta/taller/orden-trabajo/${workOrderId}/inspeccion`,
                )
              }
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Re-recepcionar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Agrupar items del checklist por categoría
  const groupedItems = CHECKLIST_ITEMS.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, Array<(typeof CHECKLIST_ITEMS)[number]>>,
  );

  const categoryLabels = {
    estado: "Estado del Vehículo",
    documentos: "Documentos",
    accesorios: "Accesorios",
    herramientas: "Herramientas",
  };

  return (
    <div className="grid gap-6">
      {/* Inspection Header */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold">Inspección de Recepción</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              tooltip="Actualizar información"
              className="shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>

            <Button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
              size="sm"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isDownloading ? "Generando PDF..." : "Generar O.R - Cliente"}
              </span>
              <span className="sm:hidden">
                {isDownloading ? "Generando..." : "O.R Cliente"}
              </span>
            </Button>

            {!cancellationRequested && (
              <Button
                variant="outline"
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs sm:text-sm flex-1 sm:flex-none"
                onClick={() => setDialogOpen(true)}
                size="sm"
              >
                <Ban className="h-4 w-4" />
                <span className="hidden sm:inline">Solicitar Anulación</span>
                <span className="sm:hidden">Anular</span>
              </Button>
            )}

            {cancellationRequested && (
              <Button
                variant="destructive"
                className="gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
                onClick={() => setConfirmDialogOpen(true)}
                size="sm"
              >
                <Ban className="h-4 w-4" />
                <span className="hidden sm:inline">Confirmar Anulación</span>
                <span className="sm:hidden">Confirmar</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">
                Fecha de Inspección
              </p>
              <p className="font-semibold text-sm sm:text-base truncate">
                {new Date(inspection.inspection_date).toLocaleString("es-PE")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <User className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">
                Inspeccionado por
              </p>
              <p className="font-semibold text-sm sm:text-base truncate">
                {inspection.inspected_by_name}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <ImageIcon className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">
                Daños Registrados
              </p>
              <p className="font-semibold text-sm sm:text-base">
                {inspection.damages?.length || 0} daños
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Pending cancellation banner */}
      {cancellationRequested && (
        <Card className="p-4 border-amber-200 bg-amber-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">
                Anulación solicitada — pendiente de confirmación
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Motivo: {inspection.cancellation_reason}
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-xs text-amber-600">
                Solicitado por {inspection.cancellation_requested_by_name}
              </p>
              <p className="text-xs text-amber-500">
                {inspection.cancellation_requested_at
                  ? new Date(
                      inspection.cancellation_requested_at,
                    ).toLocaleString("es-PE")
                  : ""}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Vehicle Photos */}
      {(inspection.photo_front_url ||
        inspection.photo_back_url ||
        inspection.photo_left_url ||
        inspection.photo_right_url) && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-gray-600" />
            Fotos del Vehículo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inspection.photo_front_url && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-700">
                  Vista Frontal
                </p>
                <div className="relative h-48 sm:h-64 bg-gray-100 rounded-lg overflow-hidden group">
                  <img
                    src={inspection.photo_front_url}
                    alt="Vista frontal del vehículo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex items-center justify-center h-full text-gray-400">
                            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-xs ml-2">Error al cargar imagen</p>
                          </div>
                        `;
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() =>
                      window.open(inspection.photo_front_url, "_blank")
                    }
                    title="Ver imagen en nueva pestaña"
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {inspection.photo_back_url && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-700">
                  Vista Trasera
                </p>
                <div className="relative h-48 sm:h-64 bg-gray-100 rounded-lg overflow-hidden group">
                  <img
                    src={inspection.photo_back_url}
                    alt="Vista trasera del vehículo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex items-center justify-center h-full text-gray-400">
                            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-xs ml-2">Error al cargar imagen</p>
                          </div>
                        `;
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() =>
                      window.open(inspection.photo_back_url, "_blank")
                    }
                    title="Ver imagen en nueva pestaña"
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {inspection.photo_left_url && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-700">
                  Vista Lateral Izquierda
                </p>
                <div className="relative h-48 sm:h-64 bg-gray-100 rounded-lg overflow-hidden group">
                  <img
                    src={inspection.photo_left_url}
                    alt="Vista lateral izquierda del vehículo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex items-center justify-center h-full text-gray-400">
                            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-xs ml-2">Error al cargar imagen</p>
                          </div>
                        `;
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() =>
                      window.open(inspection.photo_left_url, "_blank")
                    }
                    title="Ver imagen en nueva pestaña"
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {inspection.photo_right_url && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-700">
                  Vista Lateral Derecha
                </p>
                <div className="relative h-48 sm:h-64 bg-gray-100 rounded-lg overflow-hidden group">
                  <img
                    src={inspection.photo_right_url}
                    alt="Vista lateral derecha del vehículo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex items-center justify-center h-full text-gray-400">
                            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-xs ml-2">Error al cargar imagen</p>
                          </div>
                        `;
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() =>
                      window.open(inspection.photo_right_url, "_blank")
                    }
                    title="Ver imagen en nueva pestaña"
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Checklist by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <Card key={category} className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <div className="space-y-2">
              {items.map((item) => {
                const value = inspection[item.key as keyof typeof inspection];
                const isChecked = typeof value === "boolean" ? value : false;

                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg gap-2"
                  >
                    <p className="text-xs sm:text-sm flex-1">{item.label}</p>
                    {isChecked ? (
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Vehicle Diagram with Damage Markers */}
      {inspection.damages && inspection.damages.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            Diagrama del Vehículo con Daños Marcados
          </h3>
          <div className="relative w-full bg-gray-50 rounded-lg p-4 sm:p-8">
            <div className="relative mx-auto" style={{ maxWidth: "800px" }}>
              <img
                src="/images/body_car.png"
                alt="Diagrama del vehículo"
                className="w-full h-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="aspect-video w-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <div class="text-center text-gray-500">
                          <svg class="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          <p>Vista del vehículo</p>
                        </div>
                      </div>
                    `;
                  }
                }}
              />
              {/* Damage markers overlay */}
              {inspection.damages.map((damage) => {
                const xCoord =
                  typeof damage.x_coordinate === "string"
                    ? parseFloat(damage.x_coordinate)
                    : damage.x_coordinate;
                const yCoord =
                  typeof damage.y_coordinate === "string"
                    ? parseFloat(damage.y_coordinate)
                    : damage.y_coordinate;

                if (xCoord === undefined || yCoord === undefined) return null;

                return (
                  <div
                    key={damage.id}
                    className="absolute group cursor-pointer"
                    style={{
                      left: `${xCoord}%`,
                      top: `${yCoord}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {/* Marker */}
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg transition-transform group-hover:scale-125"
                      style={{
                        backgroundColor:
                          DAMAGE_COLORS[
                            damage.damage_type as keyof typeof DAMAGE_COLORS
                          ] || "#ef4444",
                      }}
                    >
                      {
                        DAMAGE_SYMBOLS[
                          damage.damage_type as keyof typeof DAMAGE_SYMBOLS
                        ]
                      }
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block w-48 sm:w-64 z-10">
                      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl text-sm">
                        <p className="font-bold mb-1">{damage.damage_type}</p>
                        {damage.description && (
                          <p className="text-gray-300 mb-2">
                            {damage.description}
                          </p>
                        )}
                        {damage.photo_url && (
                          <img
                            src={damage.photo_url}
                            alt="Daño"
                            className="w-full h-32 object-cover rounded mt-2"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-2 sm:gap-4 justify-center">
              {Object.entries(DAMAGE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {DAMAGE_SYMBOLS[type as keyof typeof DAMAGE_SYMBOLS]}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700">
                    {type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Vehicle Damages */}
      {inspection.damages && inspection.damages.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            Daños del Vehículo
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {inspection.damages.map((damage) => {
              const xCoord =
                typeof damage.x_coordinate === "string"
                  ? parseFloat(damage.x_coordinate)
                  : damage.x_coordinate;
              const yCoord =
                typeof damage.y_coordinate === "string"
                  ? parseFloat(damage.y_coordinate)
                  : damage.y_coordinate;

              return (
                <div
                  key={damage.id}
                  className="border rounded-lg p-3 sm:p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-lg sm:text-xl font-bold"
                      style={{
                        color:
                          DAMAGE_COLORS[
                            damage.damage_type as keyof typeof DAMAGE_COLORS
                          ],
                      }}
                    >
                      {
                        DAMAGE_SYMBOLS[
                          damage.damage_type as keyof typeof DAMAGE_SYMBOLS
                        ]
                      }
                    </span>
                    <Badge
                      style={{
                        backgroundColor:
                          DAMAGE_COLORS[
                            damage.damage_type as keyof typeof DAMAGE_COLORS
                          ],
                        color: "white",
                      }}
                      className="text-xs"
                    >
                      {damage.damage_type}
                    </Badge>
                  </div>

                  {damage.description && (
                    <p className="text-xs sm:text-sm text-gray-700">
                      {damage.description}
                    </p>
                  )}

                  {xCoord !== undefined && yCoord !== undefined && (
                    <div className="text-xs text-gray-500">
                      Ubicación: {xCoord.toFixed(1)}%, {yCoord.toFixed(1)}%
                    </div>
                  )}

                  {damage.photo_url && (
                    <div className="relative h-40 sm:h-48 bg-gray-100 rounded overflow-hidden group">
                      <img
                        src={damage.photo_url}
                        alt={`Daño: ${damage.damage_type}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="flex items-center justify-center h-full text-gray-400">
                                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p class="text-xs ml-2">Error al cargar imagen</p>
                              </div>
                            `;
                          }
                        }}
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => window.open(damage.photo_url, "_blank")}
                        title="Ver imagen en nueva pestaña"
                      >
                        <Expand className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* No se encontraron daños en el vehiculo */}
      {inspection.damages?.length === 0 && (
        <Card className="p-8 border-2 border-gray-100 bg-gray-50/50">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-gray-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-gray-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Vehículo en perfecto estado
              </h3>
              <p className="text-gray-600 max-w-md">
                La inspección de recepción se ha completado exitosamente. No se
                identificaron daños, rayones o desperfectos en el vehículo.
              </p>
            </div>
            <div className="mt-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">
                ✓ Inspección completada sin observaciones
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* General Observations */}
      {inspection.general_observations && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            Observaciones Generales
          </h3>
          <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 sm:p-4 rounded-lg">
            {inspection.general_observations}
          </p>
        </Card>
      )}

      {/* Customer Signature */}
      {inspection.customer_signature_url && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-600" />
            Firma de Conformidad del Cliente
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <p className="text-sm text-gray-600 mb-4 text-center">
              El cliente confirma que la información registrada en la inspección
              de recepción es correcta
            </p>
            <div className="flex justify-center">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 inline-block">
                <img
                  src={inspection.customer_signature_url}
                  alt="Firma del cliente"
                  className="max-h-32 w-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex items-center justify-center h-32 w-64 text-gray-400">
                          <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <p class="text-sm ml-2">Error al cargar firma</p>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="inline-block border-t-2 border-gray-300 pt-2 px-8">
                <p className="text-sm font-medium text-gray-700">
                  Firma del Cliente
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(inspection.inspection_date).toLocaleDateString(
                    "es-PE",
                  )}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Dialog: solicitar anulación con motivo */}
      <ConfirmationDialog
        trigger={<span />}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Solicitar anulación de inspección"
        description="Ingresa el motivo por el cual se anula esta inspección de recepción."
        confirmText="Confirmar solicitud"
        cancelText="Cancelar"
        variant="destructive"
        icon="warning"
        confirmDisabled={!cancellationReason.trim() || isCancelling}
        onConfirm={handleRequestCancellation}
      >
        <textarea
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          rows={3}
          placeholder="Ej: Equivocación de 10 000 a 100 000 km, daño no visible en la inspección, etc."
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
        />
      </ConfirmationDialog>

      {/* Dialog: confirmar anulación */}
      <ConfirmationDialog
        trigger={<span />}
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Confirmar anulación"
        description="Esta acción anulará definitivamente la inspección de recepción. Una vez anulada, se deberá realizar una nueva recepción."
        confirmText="Confirmar anulación"
        cancelText="Cancelar"
        variant="destructive"
        icon="danger"
        onConfirm={handleConfirmCancellation}
      />
    </div>
  );
}
