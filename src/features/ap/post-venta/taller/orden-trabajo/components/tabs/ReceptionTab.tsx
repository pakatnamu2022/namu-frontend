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
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CHECKLIST_ITEMS } from "@/features/ap/post-venta/taller/inspeccion-vehiculo/lib/vehicleInspection.constants";
import {
  DAMAGE_SYMBOLS,
  DAMAGE_COLORS,
} from "@/features/ap/post-venta/taller/inspeccion-vehiculo/lib/vehicleInspection.interface";
import { downloadVehicleInspectionPdf } from "@/features/ap/post-venta/taller/inspeccion-vehiculo/lib/vehicleInspection.actions";
import { useState } from "react";
import { errorToast, successToast } from "@/core/core.function";
import { findWorkOrderById } from "../../lib/workOrder.actions";

interface ReceptionTabProps {
  workOrderId: number;
}

export default function ReceptionTab({ workOrderId }: ReceptionTabProps) {
  const [isDownloading, setIsDownloading] = useState(false);

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
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Inspección de Recepción</h3>
          <Button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            {isDownloading
              ? "Generando PDF..."
              : "Generar Orden Recepción - Cliente"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Fecha de Inspección</p>
              <p className="font-semibold">
                {new Date(inspection.inspection_date).toLocaleString("es-PE")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <User className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Inspeccionado por</p>
              <p className="font-semibold">{inspection.inspected_by_name}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <ImageIcon className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Daños Registrados</p>
              <p className="font-semibold">
                {inspection.damages?.length || 0} daños
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Vehicle Photos */}
      {(inspection.photo_front_url ||
        inspection.photo_back_url ||
        inspection.photo_left_url ||
        inspection.photo_right_url) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-gray-600" />
            Fotos del Vehículo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspection.photo_front_url && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Vista Frontal
                </p>
                <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden group">
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
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
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
                <p className="text-sm font-medium text-gray-700">
                  Vista Trasera
                </p>
                <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden group">
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
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
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
                <p className="text-sm font-medium text-gray-700">
                  Vista Lateral Izquierda
                </p>
                <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden group">
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
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
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
                <p className="text-sm font-medium text-gray-700">
                  Vista Lateral Derecha
                </p>
                <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden group">
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
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <Card key={category} className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <div className="space-y-2">
              {items.map((item) => {
                const value = inspection[item.key as keyof typeof inspection];
                const isChecked = typeof value === "boolean" ? value : false;

                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <p className="text-sm">{item.label}</p>
                    {isChecked ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
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
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Diagrama del Vehículo con Daños Marcados
          </h3>
          <div className="relative w-full bg-gray-50 rounded-lg p-8">
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
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform group-hover:scale-125"
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
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block w-64 z-10">
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
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              {Object.entries(DAMAGE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {DAMAGE_SYMBOLS[type as keyof typeof DAMAGE_SYMBOLS]}
                  </div>
                  <span className="text-sm text-gray-700">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Vehicle Damages */}
      {inspection.damages && inspection.damages.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daños del Vehículo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xl font-bold"
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
                    >
                      {damage.damage_type}
                    </Badge>
                  </div>

                  {damage.description && (
                    <p className="text-sm text-gray-700">
                      {damage.description}
                    </p>
                  )}

                  {xCoord !== undefined && yCoord !== undefined && (
                    <div className="text-xs text-gray-500">
                      Ubicación: {xCoord.toFixed(1)}%, {yCoord.toFixed(1)}%
                    </div>
                  )}

                  {damage.photo_url && (
                    <div className="relative h-48 bg-gray-100 rounded overflow-hidden group">
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
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
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
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Observaciones Generales
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
            {inspection.general_observations}
          </p>
        </Card>
      )}

      {/* Customer Signature */}
      {inspection.customer_signature_url && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-600" />
            Firma de Conformidad del Cliente
          </h3>
          <div className="bg-gray-50 rounded-lg p-6">
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
    </div>
  );
}
