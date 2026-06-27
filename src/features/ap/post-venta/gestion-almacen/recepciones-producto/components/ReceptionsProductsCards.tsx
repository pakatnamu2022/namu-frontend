import { ReceptionResource } from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/lib/receptionsProducts.interface.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import {
  Calendar,
  FileText,
  Package,
  User,
  Box,
  TruckIcon,
  AlertCircle,
  Building2,
  Coins,
  Tag,
  FileCheck,
  Eye,
  Trash2,
  Ban,
  ChevronDown,
  ChevronUp,
  ReceiptText,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge.tsx";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import {
  translateReasonObservation,
  translateReceptionTypeStatus,
} from "@/features/ap/post-venta/gestion-almacen/recepcion-transferencia/lib/transferReception.constants.ts";
import { useState } from "react";
import { CopyCell } from "@/shared/components/CopyCell.tsx";
import { InvoiceDetailSheet } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/components/InvoiceDetailSheet.tsx";
import { VehiclePurchaseOrderResource } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.interface.ts";
import { translateStatusReception } from "../lib/receptionsProducts.constants";
import { Switch } from "@/components/ui/switch.tsx";
import { useUpdateDetailCreditNote } from "../lib/receptionsProducts.hook";
import { useQueryClient } from "@tanstack/react-query";
import { RECEPTION } from "../lib/receptionsProducts.constants";
import { successToast, errorToast } from "@/core/core.function";

interface Props {
  data: ReceptionResource[];
  routeUpdate?: string;
  routeInvoice?: string;
  supplierOrderNumber?: string;
  warehouseName?: string;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
  onRefresh?: () => void;
}

export default function ReceptionsProductsCards({
  data,
  routeInvoice,
  supplierOrderNumber,
  warehouseName,
  onDelete,
  isDeleting,
  onRefresh,
}: Props) {
  const [selectedInvoice, setSelectedInvoice] =
    useState<VehiclePurchaseOrderResource | null>(null);
  const [expandedAnnulled, setExpandedAnnulled] = useState<Set<number>>(
    new Set(),
  );
  const queryClient = useQueryClient();
  const { mutate: updateCreditNote, isPending: isUpdatingCreditNote } =
    useUpdateDetailCreditNote();

  const toggleAnnulled = (id: number) =>
    setExpandedAnnulled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay recepciones registradas
      </div>
    );
  }

  const activeReceptions = data.filter((r) => r.status !== "ANNULLED");
  const annulledReceptions = data.filter((r) => r.status === "ANNULLED");

  const getGridCols = () => {
    if (activeReceptions.length === 1) return "grid-cols-1";
    if (activeReceptions.length === 2) return "grid-cols-1 lg:grid-cols-2";
    return "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3";
  };

  const isSingleCard = activeReceptions.length === 1;

  return (
    <div className="space-y-4">
      {/* Recepciones activas */}
      {activeReceptions.length > 0 && (
        <div className={`grid ${getGridCols()} gap-4`}>
          {activeReceptions.map((reception) => (
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
                          {translateStatusReception(reception.status)}
                        </Badge>
                      )}
                      {reception.reception_type && (
                        <Badge
                          variant="outline"
                          className={isSingleCard ? "text-xs" : "text-[10px]"}
                        >
                          {translateReceptionTypeStatus(
                            reception.reception_type,
                          )}
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-muted-foreground ${
                        isSingleCard ? "text-sm mt-1" : "text-xs mt-0.5"
                      }`}
                    >
                      {supplierOrderNumber || "-"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {routeInvoice && !reception.purchase_order && (
                      <Link to={`${routeInvoice}/${reception.id}`}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          tooltip="Registrar Factura de Compra"
                        >
                          <FileCheck className="size-4" />
                        </Button>
                      </Link>
                    )}
                    {reception.purchase_order && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        tooltip="Ver Factura"
                        onClick={() =>
                          setSelectedInvoice(reception.purchase_order!)
                        }
                      >
                        <Eye className="size-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        tooltip="Eliminar recepción"
                        disabled={isDeleting}
                        onClick={() => onDelete(reception.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Información del proveedor y sede */}
                {reception.purchase_order && (
                  <div
                    className={`${
                      isSingleCard ? "p-4 mb-4" : "p-3 mb-3"
                    } bg-muted/30 rounded-lg`}
                  >
                    <div className="flex items-start gap-2">
                      <Building2
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
                          {reception.purchase_order.supplier}
                        </p>
                        <p
                          className={`text-muted-foreground ${
                            isSingleCard ? "text-sm" : "text-xs"
                          }`}
                        >
                          RUC: {reception.purchase_order.supplier_num_doc}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            variant="outline"
                            className={isSingleCard ? "text-xs" : "text-[10px]"}
                          >
                            {reception.purchase_order.sede}
                          </Badge>
                          {reception.purchase_order.currency && (
                            <Badge
                              variant="outline"
                              className={`${
                                isSingleCard ? "text-xs" : "text-[10px]"
                              }`}
                            >
                              <Coins className="size-3 mr-1" />
                              {reception.purchase_order.currency_code}
                            </Badge>
                          )}
                        </div>
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
                        className={`font-medium ${
                          isSingleCard ? "text-base" : ""
                        }`}
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

                  <div className="flex items-start gap-2 text-sm">
                    <Package className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-muted-foreground ${
                          isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
                        }`}
                      >
                        Almacén
                      </p>
                      <p
                        className={`font-medium ${
                          isSingleCard ? "text-base" : ""
                        } truncate`}
                      >
                        {warehouseName ||
                          reception.warehouse?.description ||
                          "-"}
                      </p>
                    </div>
                  </div>

                  {reception.shipping_guide_number && (
                    <div className="flex items-start gap-2 text-sm">
                      <TruckIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p
                          className={`text-muted-foreground ${
                            isSingleCard
                              ? "text-xs font-medium mb-1"
                              : "text-xs"
                          }`}
                        >
                          Guía de Remisión
                        </p>
                        <p
                          className={`font-medium ${
                            isSingleCard ? "text-base" : ""
                          }`}
                        >
                          {reception.shipping_guide_number}
                        </p>
                      </div>
                    </div>
                  )}

                  {reception.freight_cost !== undefined &&
                    reception.freight_cost !== null && (
                      <div className="flex items-start gap-2 text-sm">
                        <Coins className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p
                            className={`text-muted-foreground ${
                              isSingleCard
                                ? "text-xs font-medium mb-1"
                                : "text-xs"
                            }`}
                          >
                            Costo de Flete
                          </p>
                          <p
                            className={`font-medium ${
                              isSingleCard ? "text-base" : ""
                            }`}
                          >
                            {"S/."} {Number(reception.freight_cost).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                  {reception.carrier && (
                    <div className="flex items-start gap-2 text-sm">
                      <TruckIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-muted-foreground ${
                            isSingleCard
                              ? "text-xs font-medium mb-1"
                              : "text-xs"
                          }`}
                        >
                          Transportista
                        </p>
                        <p
                          className={`font-medium ${
                            isSingleCard ? "text-base" : ""
                          } truncate`}
                        >
                          {reception.carrier.full_name || "-"}
                        </p>
                        {reception.carrier.num_doc && (
                          <p
                            className={`text-muted-foreground ${
                              isSingleCard ? "text-xs" : "text-[10px]"
                            }`}
                          >
                            RUC: {reception.carrier.num_doc}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {reception.received_by_user_name && (
                    <div className="flex items-start gap-2 text-sm">
                      <User className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-muted-foreground ${
                            isSingleCard
                              ? "text-xs font-medium mb-1"
                              : "text-xs"
                          }`}
                        >
                          Recibido por
                        </p>
                        <p
                          className={`font-medium ${
                            isSingleCard ? "text-sm" : "text-xs"
                          } truncate`}
                        >
                          {reception.received_by_user_name}
                        </p>
                      </div>
                    </div>
                  )}

                  {reception.total_quantity && (
                    <div className="flex items-start gap-2 text-sm">
                      <Box className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p
                          className={`text-muted-foreground ${
                            isSingleCard
                              ? "text-xs font-medium mb-1"
                              : "text-xs"
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
                  )}

                  {reception.total_items !== undefined && (
                    <div className="flex items-start gap-2 text-sm">
                      {isSingleCard && (
                        <Package className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p
                          className={`text-muted-foreground ${
                            isSingleCard
                              ? "text-xs font-medium mb-1"
                              : "text-xs"
                          }`}
                        >
                          Items Únicos
                        </p>
                        <Badge
                          color="secondary"
                          className={isSingleCard ? "text-sm" : "text-xs"}
                        >
                          {reception.total_items}{" "}
                          {reception.total_items === 1 ? "item" : "items"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notas de recepción */}
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

                {/* Lista de productos recepcionados */}
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
                        Repuestos Recepcionados ({reception.details.length})
                      </p>
                    </div>
                    <div
                      className={`space-y-2 ${
                        isSingleCard ? "max-h-80" : "max-h-64"
                      } overflow-y-auto pr-1`}
                    >
                      {reception.details.map((detail, idx) => (
                        <div
                          key={idx}
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
                                {detail.product?.name || "Repuesto sin nombre"}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {detail.product?.code && (
                                  <Badge
                                    variant="outline"
                                    className={
                                      isSingleCard ? "text-xs" : "text-[10px]"
                                    }
                                  >
                                    <Tag className="size-3 mr-1" />
                                    <CopyCell
                                      value={detail.product.code}
                                      label={`Cód: ${detail.product.code}`}
                                    />
                                  </Badge>
                                )}
                                {detail.product?.dyn_code && (
                                  <Badge
                                    variant="outline"
                                    className={
                                      isSingleCard ? "text-xs" : "text-[10px]"
                                    }
                                  >
                                    <Tag className="size-3 mr-1" />
                                    <CopyCell
                                      value={detail.product.dyn_code}
                                      label={`Cód Dyn: ${detail.product.dyn_code}`}
                                    />
                                  </Badge>
                                )}
                                {detail.product?.brand_name && (
                                  <Badge
                                    variant="outline"
                                    className={
                                      isSingleCard ? "text-xs" : "text-[10px]"
                                    }
                                  >
                                    {detail.product.brand_name}
                                  </Badge>
                                )}
                                {detail.product?.category_name && (
                                  <Badge
                                    variant="outline"
                                    className={
                                      isSingleCard ? "text-xs" : "text-[10px]"
                                    }
                                  >
                                    {detail.product.category_name}
                                  </Badge>
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
                                {detail.product?.unit_measurement_name &&
                                  ` ${detail.product.unit_measurement_name}`}
                              </Badge>
                            </div>
                          </div>

                          {detail.observed_quantity &&
                            Number(detail.observed_quantity) > 0 && (
                              <div className="mt-2 pt-2 border-t bg-yellow-500/10 -mx-3 -mb-3 px-3 py-2 rounded-b-lg">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="size-4 text-yellow-600 shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <p className="font-medium text-yellow-900 text-xs">
                                        Cantidad Pendiente:{" "}
                                        {Number(
                                          detail.observed_quantity,
                                        ).toFixed(2)}
                                      </p>
                                      {detail.is_credit_note && (
                                        <Badge
                                          className="text-[10px] h-4 px-1.5 gap-1"
                                          color="blue"
                                        >
                                          <ReceiptText className="size-3" />
                                          Nota de Crédito
                                        </Badge>
                                      )}
                                      <Switch
                                        checked={detail.is_credit_note}
                                        disabled={isUpdatingCreditNote}
                                        onCheckedChange={(checked) =>
                                          updateCreditNote(
                                            {
                                              detailId: detail.id,
                                              isCreditNote: checked,
                                            },
                                            {
                                              onSuccess: () => {
                                                successToast(
                                                  "Detalle actualizado correctamente",
                                                );
                                                queryClient.removeQueries({
                                                  queryKey: [
                                                    RECEPTION.QUERY_KEY,
                                                    reception.id,
                                                  ],
                                                });
                                                onRefresh?.();
                                              },
                                              onError: (error: any) => {
                                                const msg =
                                                  error?.response?.data
                                                    ?.message ||
                                                  "Error al actualizar detalle";
                                                errorToast(msg);
                                              },
                                            },
                                          )
                                        }
                                      />
                                    </div>
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

                          {(detail.batch_number || detail.expiration_date) && (
                            <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-2 text-xs">
                              {detail.batch_number && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Lote:{" "}
                                  </span>
                                  <span className="font-medium">
                                    {detail.batch_number}
                                  </span>
                                </div>
                              )}
                              {detail.expiration_date && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Vence:{" "}
                                  </span>
                                  <span className="font-medium">
                                    {format(
                                      new Date(detail.expiration_date),
                                      "dd/MM/yyyy",
                                      { locale: es },
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {detail.notes && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs text-muted-foreground">
                                Nota: {detail.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recepciones anuladas — compactas, al final */}
      {annulledReceptions.length > 0 && (
        <div className="border border-dashed border-muted-foreground/25 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="size-3.5 text-muted-foreground/60" />
            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
              Anuladas ({annulledReceptions.length})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {annulledReceptions.map((reception) => {
              const isExpanded = expandedAnnulled.has(reception.id);
              return (
                <div key={reception.id} className="w-full">
                  {/* Píldora / fila de resumen */}
                  <button
                    type="button"
                    onClick={() => toggleAnnulled(reception.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/40 border border-muted text-muted-foreground/70 opacity-60 hover:opacity-90 hover:bg-muted/60 transition-all w-full text-left"
                  >
                    <Ban className="size-3 shrink-0" />
                    {reception.id}
                    <span className="text-xs font-medium line-through flex-1">
                      {reception.reception_number || `#${reception.id}`}
                    </span>
                    {reception.reception_date && (
                      <span className="text-[10px] text-muted-foreground/50">
                        {format(
                          new Date(reception.reception_date),
                          "dd/MM/yy",
                          { locale: es },
                        )}
                      </span>
                    )}
                    {reception.reception_type && (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 px-1 opacity-70"
                      >
                        {translateReceptionTypeStatus(reception.reception_type)}
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="size-3 shrink-0" />
                    ) : (
                      <ChevronDown className="size-3 shrink-0" />
                    )}
                  </button>

                  {/* Detalle expandido */}
                  {isExpanded && (
                    <div className="mt-2 ml-2 pl-3 border-l border-muted-foreground/20 space-y-2 opacity-70">
                      {/* Proveedor */}
                      {reception.purchase_order && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building2 className="size-3 shrink-0" />
                          <span className="font-medium truncate">
                            {reception.purchase_order.supplier}
                          </span>
                          <span className="text-[10px]">
                            RUC: {reception.purchase_order.supplier_num_doc}
                          </span>
                        </div>
                      )}
                      {/* Almacén y fecha */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {reception.reception_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {format(
                              new Date(reception.reception_date),
                              "dd/MM/yyyy",
                              { locale: es },
                            )}
                          </span>
                        )}
                        {(warehouseName ||
                          reception.warehouse?.description) && (
                          <span className="flex items-center gap-1">
                            <Package className="size-3" />
                            {warehouseName || reception.warehouse?.description}
                          </span>
                        )}
                        {reception.received_by_user_name && (
                          <span className="flex items-center gap-1">
                            <User className="size-3" />
                            {reception.received_by_user_name}
                          </span>
                        )}
                      </div>
                      {/* Productos */}
                      {reception.details && reception.details.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wide">
                            Repuestos ({reception.details.length})
                          </p>
                          {reception.details.map((detail, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-muted/30 text-xs"
                            >
                              <span className="truncate text-muted-foreground">
                                {detail.product?.name || "Sin nombre"}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4 px-1 shrink-0"
                              >
                                {Number(detail.quantity_received).toFixed(2)}
                                {detail.product?.unit_measurement_name &&
                                  ` ${detail.product.unit_measurement_name}`}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Notas */}
                      {reception.notes && (
                        <p className="text-[10px] text-muted-foreground/70 italic">
                          {reception.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedInvoice && (
        <InvoiceDetailSheet
          open={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
}
