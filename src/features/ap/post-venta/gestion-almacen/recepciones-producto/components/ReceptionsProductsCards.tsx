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
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge.tsx";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import {
  translateReasonObservation,
  translateReceptionTypeStatus,
  translateStatus,
} from "@/features/ap/post-venta/gestion-almacen/recepcion-transferencia/lib/transferReception.constants.ts";
import { useState } from "react";
import { InvoiceDetailSheet } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/components/InvoiceDetailSheet.tsx";
import { VehiclePurchaseOrderResource } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.interface.ts";

interface Props {
  data: ReceptionResource[];
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
  routeUpdate?: string;
  routeInvoice?: string;
  supplierOrderNumber?: string;
  warehouseName?: string;
}

export default function ReceptionsProductsCards({
  data,
  onDelete,
  permissions,
  routeInvoice,
  supplierOrderNumber,
  warehouseName,
}: Props) {
  const [selectedInvoice, setSelectedInvoice] =
    useState<VehiclePurchaseOrderResource | null>(null);

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay recepciones registradas
      </div>
    );
  }

  // Determinar el número de columnas según la cantidad de registros
  const getGridCols = () => {
    if (data.length === 1) return "grid-cols-1";
    if (data.length === 2) return "grid-cols-1 lg:grid-cols-2";
    return "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3";
  };

  const isSingleCard = data.length === 1;

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {data.map((reception) => (
        <Card key={reception.id} className="hover:shadow-md transition-shadow">
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
                      {translateStatus(reception.status)}
                    </Badge>
                  )}
                  {reception.reception_type && (
                    <Badge
                      variant="outline"
                      className={isSingleCard ? "text-xs" : "text-[10px]"}
                    >
                      {translateReceptionTypeStatus(reception.reception_type)}
                    </Badge>
                  )}
                </div>
                <p
                  className={`text-muted-foreground ${
                    isSingleCard ? "text-sm mt-1" : "text-xs mt-0.5"
                  }`}
                >
                  OC: {supplierOrderNumber || "-"}
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
                {permissions.canDelete && (
                  <DeleteButton onClick={() => onDelete(reception.id)} />
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

            {/* Información principal - Layout diferente según cantidad */}
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
                          {
                            locale: es,
                          },
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Almacén */}
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
                    {warehouseName || reception.warehouse?.description || "-"}
                  </p>
                </div>
              </div>

              {/* Guía de remisión */}
              {reception.shipping_guide_number && (
                <div className="flex items-start gap-2 text-sm">
                  <TruckIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
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
                      {reception.shipping_guide_number}
                    </p>
                  </div>
                </div>
              )}

              {/* Costo de flete */}
              {reception.freight_cost !== undefined &&
                reception.freight_cost !== null && (
                  <div className="flex items-start gap-2 text-sm">
                    <Coins className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p
                        className={`text-muted-foreground ${
                          isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
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

              {/* Transportista */}
              {reception.carrier && (
                <div className="flex items-start gap-2 text-sm">
                  <TruckIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-muted-foreground ${
                        isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
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

              {/* Recibido por */}
              {reception.received_by_user_name && (
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
                      {reception.received_by_user_name}
                    </p>
                  </div>
                </div>
              )}

              {/* Total cantidad */}
              {reception.total_quantity && (
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
              )}

              {/* Total items */}
              {reception.total_items !== undefined && (
                <div className="flex items-start gap-2 text-sm">
                  {isSingleCard && (
                    <Package className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-muted-foreground ${
                        isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
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
                            {detail.product?.name ||
                              detail.purchase_order_item?.product_name ||
                              "Producto sin nombre"}
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
                                {detail.product.code}
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

                      {/* Observaciones */}
                      {detail.observed_quantity &&
                        Number(detail.observed_quantity) > 0 && (
                          <div className="mt-2 pt-2 border-t bg-yellow-500/10 -mx-3 -mb-3 px-3 py-2 rounded-b-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="size-4 text-yellow-600 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-yellow-900 text-xs mb-1">
                                  Cantidad Observada:{" "}
                                  {Number(detail.observed_quantity).toFixed(2)}
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

                      {/* Lote y vencimiento */}
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
                                  {
                                    locale: es,
                                  },
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notas del detalle */}
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

      {/* Sheet para mostrar el detalle de la factura */}
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
