import { Card, CardContent } from "@/components/ui/card.tsx";
import {
  Calendar,
  FileText,
  Package,
  User,
  Box,
  TruckIcon,
  AlertCircle,
  ArrowRightLeft,
  Warehouse,
  Tag,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { TransferReceptionResource } from "@/features/ap/post-venta/gestion-almacen/recepcion-transferencia/lib/transferReception.interface.ts";
import {
  translateStatusTransfer,
  translateReasonObservation,
} from "@/features/ap/post-venta/gestion-almacen/recepcion-transferencia/lib/transferReception.constants.ts";
import { useState } from "react";

interface TransferReceptionsCardsProps {
  data: TransferReceptionResource[];
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export default function TransferReceptionsCards({
  data,
  onDelete,
  permissions,
}: TransferReceptionsCardsProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string, identifier: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(identifier);
      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay recepciones registradas
      </div>
    );
  }

  const getGridCols = () => {
    if (data.length === 1) return "grid-cols-1";
    if (data.length === 2) return "grid-cols-1 lg:grid-cols-2";
    return "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3";
  };

  const isSingleCard = data.length === 1;

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {data.map((reception) => {
        const movement = reception.transfer_movement;
        const shippingGuide = reception.shipping_guide;
        const hasObservations = reception.has_observations;

        return (
          <Card
            key={reception.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className={isSingleCard ? "p-6" : "p-4 space-y-3"}>
              {/* Header con número de recepción, estado y acciones */}
              <div
                className={`flex items-start justify-between ${
                  isSingleCard ? "gap-4 mb-4" : "gap-2 mb-3"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`font-bold text-primary ${
                        isSingleCard ? "text-2xl" : "text-lg"
                      }`}
                    >
                      {reception.reception_number || `#${reception.id}`}
                    </h3>
                    {reception.status && (
                      <Badge
                        variant="default"
                        className={isSingleCard ? "text-xs" : "text-[10px]"}
                      >
                        {reception.status === "APPROVED" ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {translateStatusTransfer(reception.status)}
                      </Badge>
                    )}
                    {hasObservations && (
                      <Badge
                        color="destructive"
                        className={`flex items-center gap-1 ${
                          isSingleCard ? "text-xs" : "text-[10px]"
                        }`}
                      >
                        <AlertCircle className="h-3 w-3" />
                        Con Observaciones
                      </Badge>
                    )}
                  </div>
                  <p
                    className={`text-muted-foreground ${
                      isSingleCard ? "text-sm mt-1" : "text-xs mt-0.5"
                    }`}
                  >
                    Movimiento: {movement?.movement_number || "-"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {permissions.canDelete && (
                    <DeleteButton onClick={() => onDelete(reception.id)} />
                  )}
                </div>
              </div>

              {/* Origen → Destino */}
              {movement && (
                <div
                  className={`${
                    isSingleCard ? "p-4 mb-4" : "p-3 mb-3"
                  } bg-muted/30 rounded-lg`}
                >
                  <div className="flex items-start gap-2">
                    <ArrowRightLeft
                      className={`text-muted-foreground shrink-0 ${
                        isSingleCard ? "size-5 mt-0.5" : "size-4"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-foreground truncate ${
                          isSingleCard ? "text-base" : "text-sm"
                        }`}
                      >
                        <span className="text-primary">
                          {movement.warehouse_origin?.dyn_code}
                        </span>
                        {" → "}
                        <span className="text-green-600">
                          {movement.warehouse_destination?.dyn_code}
                        </span>
                      </p>
                      <p
                        className={`text-muted-foreground truncate ${
                          isSingleCard ? "text-sm" : "text-xs"
                        }`}
                      >
                        {movement.warehouse_origin?.description}
                        {" → "}
                        {movement.warehouse_destination?.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Información principal */}
              <div
                className={
                  isSingleCard
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
                    : "space-y-2.5"
                }
              >
                {/* Fecha de recepción */}
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p
                      className={`text-muted-foreground ${
                        isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
                      }`}
                    >
                      Fecha de Recepción
                    </p>
                    <p
                      className={`font-medium ${isSingleCard ? "text-base" : ""}`}
                    >
                      {reception.reception_date
                        ? format(
                            new Date(reception.reception_date),
                            "dd/MM/yyyy",
                            { locale: es },
                          )
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Almacén de recepción */}
                <div className="flex items-start gap-2 text-sm">
                  <Warehouse className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-muted-foreground ${
                        isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
                      }`}
                    >
                      Almacén Recepción
                    </p>
                    <p
                      className={`font-medium ${
                        isSingleCard ? "text-base" : ""
                      } truncate`}
                    >
                      {reception.warehouse?.description || "-"}
                    </p>
                  </div>
                </div>

                {/* Guía de Remisión */}
                {shippingGuide && (
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p
                        className={`text-muted-foreground ${
                          isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
                        }`}
                      >
                        Guía de Remisión
                      </p>
                      <p
                        className={`font-medium ${
                          isSingleCard ? "text-base" : ""
                        }`}
                      >
                        {shippingGuide.document_number}
                      </p>
                      {shippingGuide.aceptada_por_sunat && (
                        <Badge
                          variant="outline"
                          className="h-5 bg-green-50 text-green-700 border-green-200 mt-1"
                        >
                          SUNAT: {shippingGuide.sunat_description}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Transporte */}
                {shippingGuide && (
                  <div className="flex items-start gap-2 text-sm">
                    <TruckIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-muted-foreground ${
                          isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
                        }`}
                      >
                        Transporte
                      </p>
                      <p
                        className={`font-medium ${
                          isSingleCard ? "text-base" : ""
                        } truncate`}
                      >
                        {shippingGuide.company_name_transport}
                      </p>
                      <p
                        className={`text-muted-foreground ${
                          isSingleCard ? "text-xs" : "text-[10px]"
                        }`}
                      >
                        Placa: {shippingGuide.plate} • Conductor:{" "}
                        {shippingGuide.driver_name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Recibido por */}
                {reception.received_name && (
                  <div className="flex items-start gap-2 text-sm">
                    <User className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-muted-foreground ${
                          isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
                        }`}
                      >
                        Recibido por
                      </p>
                      <p
                        className={`font-medium ${
                          isSingleCard ? "text-sm" : "text-xs"
                        } truncate`}
                      >
                        {reception.received_name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Cantidad total */}
                <div className="flex items-start gap-2 text-sm">
                  <Box className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p
                      className={`text-muted-foreground ${
                        isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
                      }`}
                    >
                      Cantidad Total
                    </p>
                    <Badge
                      color="secondary"
                      className={isSingleCard ? "text-sm" : "text-xs"}
                    >
                      {Number(reception.total_quantity).toFixed(2)} unidades
                    </Badge>
                  </div>
                </div>

                {/* Completado */}
                <div className="flex items-start gap-2 text-sm">
                  <Package className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p
                      className={`text-muted-foreground ${
                        isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
                      }`}
                    >
                      Completado
                    </p>
                    <Badge>{reception.completion_percentage}%</Badge>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {reception.notes && (
                <div
                  className={`${
                    isSingleCard ? "p-4 mb-4" : "p-3 mb-3"
                  } bg-blue-500/5 border border-blue-200 rounded-lg`}
                >
                  <div className="flex items-start gap-2">
                    <FileText
                      className={`text-primary shrink-0 ${
                        isSingleCard ? "size-5" : "size-4"
                      }`}
                    />
                    <div>
                      <p
                        className={`font-medium text-primary ${
                          isSingleCard ? "text-sm mb-1" : "text-xs mb-0.5"
                        }`}
                      >
                        Notas
                      </p>
                      <p
                        className={`text-primary ${
                          isSingleCard ? "text-sm" : "text-xs"
                        }`}
                      >
                        {reception.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de productos */}
              {reception.details && reception.details.length > 0 && (
                <div
                  className={`${
                    isSingleCard ? "pt-4" : "pt-3"
                  } border-t space-y-2`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Box
                      className={`text-muted-foreground ${
                        isSingleCard ? "size-5" : "size-4"
                      }`}
                    />
                    <p
                      className={`font-semibold text-muted-foreground uppercase ${
                        isSingleCard ? "text-sm" : "text-xs"
                      }`}
                    >
                      Productos Recepcionados ({reception.details.length})
                    </p>
                  </div>
                  <div
                    className={`space-y-2 ${
                      isSingleCard ? "max-h-80" : "max-h-64"
                    } overflow-y-auto pr-1`}
                  >
                    {reception.details.map((detail, idx) => (
                      <div
                        key={detail.id}
                        className={`p-3 rounded-lg border bg-card ${
                          isSingleCard ? "text-sm" : "text-xs"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-semibold truncate ${
                                isSingleCard ? "text-base" : "text-sm"
                              }`}
                            >
                              {detail.product?.name || "Producto sin nombre"}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {detail.product?.code && (
                                <div className="flex items-center gap-1">
                                  <Badge
                                    variant="outline"
                                    className={
                                      isSingleCard ? "text-xs" : "text-[10px]"
                                    }
                                  >
                                    <Tag className="size-3 mr-1" />
                                    {detail.product.code}
                                  </Badge>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 hover:bg-slate-200"
                                    onClick={() =>
                                      handleCopyCode(
                                        detail.product!.code,
                                        `product-${reception.id}-${idx}`,
                                      )
                                    }
                                  >
                                    {copiedCode ===
                                    `product-${reception.id}-${idx}` ? (
                                      <Check className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge
                              color="default"
                              className={
                                isSingleCard ? "text-sm h-7" : "text-xs h-6"
                              }
                            >
                              {Number(detail.quantity_received).toFixed(2)}
                            </Badge>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Enviado: {Number(detail.quantity_sent).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Observaciones del detalle */}
                        {detail.observed_quantity &&
                          Number(detail.observed_quantity) > 0 && (
                            <div className="mt-2 pt-2 border-t bg-yellow-500/10 -mx-3 -mb-3 px-3 py-2 rounded-b-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="size-4 text-yellow-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-medium text-yellow-900 text-xs mb-1">
                                    Cantidad Observada:{" "}
                                    {Number(detail.observed_quantity).toFixed(
                                      2,
                                    )}
                                  </p>
                                  {detail.reason_observation && (
                                    <p className="text-yellow-700 text-xs">
                                      Razón:{" "}
                                      {translateReasonObservation(
                                        detail.reason_observation,
                                      )}
                                    </p>
                                  )}
                                  {detail.observation_notes && (
                                    <p className="text-yellow-700 text-xs mt-1">
                                      {detail.observation_notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observaciones generales */}
              {hasObservations && (
                <div className="pt-2 border-t bg-orange-50 -mx-6 -mb-6 px-6 pb-6 mt-3 rounded-b-lg">
                  <p className="font-medium text-orange-700 mb-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Observaciones Detectadas
                  </p>
                  <p className="text-orange-600">
                    Cantidad observada: {reception.total_observed_quantity}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
