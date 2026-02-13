import { InventoryMovementResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventoryMovements.interface.ts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { ReceptionResource } from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/lib/receptionsProducts.interface.ts";
import { ShipmentsReceptionsResource } from "@/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.interface.ts";
import { WorkOrderPartsResource } from "../../../taller/orden-trabajo-repuesto/lib/workOrderParts.interface.ts";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface.ts";
import { TransferReceptionResource } from "../../recepcion-transferencia/lib/transferReception.interface.ts";

interface InventoryMovementDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement: InventoryMovementResource;
}

const getStatusLabel = (status: string) => {
  const statusLabels: Record<string, string> = {
    APPROVED: "Aprobado",
    PENDING: "Pendiente",
    REJECTED: "Rechazado",
    CANCELLED: "Cancelado",
    COMPLETED: "Completado",
    DRAFT: "Borrador",
  };
  return statusLabels[status] || status;
};

export default function InventoryMovementDetailsSheet({
  open,
  onOpenChange,
  movement,
}: InventoryMovementDetailsSheetProps) {
  const renderReferenceDetails = () => {
    if (!movement.reference) {
      // Mostrar información de ajustes si no hay referencia pero hay reason_in_out
      if (movement.reason_in_out) {
        return (
          <div className="border rounded-lg">
            <div className="p-4 bg-muted/50 border-b">
              <h3 className="font-semibold text-sm">Detalles del Ajuste</h3>
            </div>
            <div className="p-4">
              <div>
                <p className="text-xs text-muted-foreground">Motivo</p>
                <p className="font-semibold">
                  {movement.reason_in_out.description}
                </p>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Código</p>
                <p className="font-medium">{movement.reason_in_out.code}</p>
              </div>
            </div>
          </div>
        );
      }
      return null;
    }

    const { movement_type } = movement;
    const reference = movement.reference;

    switch (movement_type) {
      case "PURCHASE_RECEPTION": {
        const reception = reference as ReceptionResource;
        const purchaseOrder = reception.purchase_order;

        return (
          <div className="space-y-4">
            {/* Información de la Recepción */}
            <div className="border rounded-lg">
              <div className="p-4 bg-muted/50 border-b">
                <h3 className="font-semibold text-sm">Detalles de Recepción</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">N° Recepción</p>
                  <p className="font-semibold">{reception.reception_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {format(new Date(reception.reception_date), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">N° Guía</p>
                  <p className="font-medium">
                    {reception.shipping_guide_number || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <Badge>{getStatusLabel(reception.status || "")}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                  <p className="font-medium">{reception.total_items || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Cantidad Total
                  </p>
                  <p className="font-medium">{reception.total_quantity || 0}</p>
                </div>
                {reception.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Notas</p>
                    <p className="font-medium text-sm">{reception.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Proveedor y Orden de Compra */}
            {purchaseOrder && (
              <div className="border rounded-lg">
                <div className="p-4 bg-muted/50 border-b">
                  <h3 className="font-semibold text-sm">
                    Información del Proveedor y Orden de Compra
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Proveedor</p>
                    <p className="font-semibold">{reception.supplier_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">RUC</p>
                    <p className="font-medium">{reception.supplier_num_doc}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">N° Orden</p>
                    <p className="font-medium">{purchaseOrder.number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Fecha Emisión
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(purchaseOrder.emission_date),
                        "dd/MM/yyyy",
                        { locale: es },
                      )}
                    </p>
                  </div>
                  {purchaseOrder.invoice_series &&
                    purchaseOrder.invoice_number && (
                      <div>
                        <p className="text-xs text-muted-foreground">Factura</p>
                        <p className="font-semibold">
                          {purchaseOrder.invoice_series}-
                          {purchaseOrder.invoice_number}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        );
      }

      case "TRANSFER_OUT": {
        const shipment = reference as ShipmentsReceptionsResource;

        return (
          <div className="space-y-4">
            {/* Información Principal */}
            <div className="border rounded-lg">
              <div className="p-4 bg-muted/50 border-b">
                <h3 className="font-semibold text-sm">
                  Detalles de Transferencia
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">N° Documento</p>
                  <p className="font-semibold">{shipment.document_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Serie</p>
                  <p className="font-medium">{shipment.series}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha Emisión</p>
                  <p className="font-medium">
                    {format(new Date(shipment.issue_date), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Paquetes
                  </p>
                  <p className="font-medium">{shipment.total_packages}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Peso Total</p>
                  <p className="font-medium">{shipment.total_weight} kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado SUNAT</p>
                  <Badge
                    variant={
                      shipment.aceptada_por_sunat ? "default" : "outline"
                    }
                  >
                    {shipment.sunat_description || "PENDIENTE"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Información del Transportista */}
            <div className="border rounded-lg">
              <div className="p-3 bg-muted/50 border-b">
                <h4 className="font-semibold text-xs">
                  Información del Transportista
                </h4>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Empresa</p>
                  <p className="font-medium text-sm">
                    {shipment.company_name_transport}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    RUC: {shipment.ruc_transport}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conductor</p>
                  <p className="font-medium text-sm">{shipment.driver_name}</p>
                  <p className="text-xs text-muted-foreground">
                    DNI: {shipment.driver_doc} | Licencia: {shipment.license} |
                    Placa: {shipment.plate}
                  </p>
                </div>
              </div>
            </div>

            {/* Direcciones */}
            {(shipment.transmitter_establishment ||
              shipment.receiver_establishment) && (
              <div className="grid grid-cols-1 gap-4">
                {shipment.transmitter_establishment && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Origen</p>
                    <p className="font-medium text-sm">
                      {shipment.transmitter_establishment.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shipment.transmitter_establishment.full_address}
                    </p>
                  </div>
                )}
                {shipment.receiver_establishment && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      Destino
                    </p>
                    <p className="font-medium text-sm">
                      {shipment.receiver_establishment.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shipment.receiver_establishment.full_address}
                    </p>
                  </div>
                )}
              </div>
            )}

            {shipment.notes && (
              <div className="p-4 border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Notas</p>
                <p className="font-medium text-sm">{shipment.notes}</p>
              </div>
            )}

            {shipment.enlace_del_pdf && (
              <div>
                <a
                  href={shipment.enlace_del_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  📄 Ver PDF del Documento
                </a>
              </div>
            )}
          </div>
        );
      }

      case "TRANSFER_IN": {
        const transferReception = reference as TransferReceptionResource;
        const transferMovement = transferReception.transfer_movement;
        const shippingGuide = transferReception.shipping_guide;

        return (
          <div className="space-y-4">
            {/* Información de la Recepción */}
            <div className="border rounded-lg">
              <div className="p-4 bg-muted/50 border-b">
                <h3 className="font-semibold text-sm">
                  Detalles de Recepción de Transferencia
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">N° Recepción</p>
                  <p className="font-semibold">
                    {transferReception.reception_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {format(
                      new Date(transferReception.reception_date),
                      "dd/MM/yyyy",
                      { locale: es },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                  <p className="font-medium">{transferReception.total_items}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Cantidad Total
                  </p>
                  <p className="font-medium">
                    {transferReception.total_quantity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <Badge variant="default">
                    {getStatusLabel(transferReception.status)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Información del Movimiento de Transferencia */}
            {transferMovement && (
              <div className="border rounded-lg">
                <div className="p-4 bg-muted/50 border-b">
                  <h3 className="font-semibold text-sm">
                    Información del Movimiento
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      N° Movimiento
                    </p>
                    <p className="font-semibold">
                      {transferMovement.movement_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Almacén Origen
                    </p>
                    <p className="font-medium">
                      {transferMovement.warehouse_origin.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Usuario</p>
                    <p className="font-medium">{transferMovement.user_name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Información de la Guía de Remisión */}
            {shippingGuide && (
              <div className="border rounded-lg">
                <div className="p-4 bg-muted/50 border-b">
                  <h3 className="font-semibold text-sm">Guía de Remisión</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">N° Guía</p>
                    <p className="font-semibold">
                      {shippingGuide.document_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Fecha Emisión
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(shippingGuide.issue_date),
                        "dd/MM/yyyy",
                        {
                          locale: es,
                        },
                      )}
                    </p>
                  </div>
                  {shippingGuide.enlace_del_pdf && (
                    <div className="col-span-2">
                      <a
                        href={shippingGuide.enlace_del_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        📄 Ver PDF de la Guía
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {transferReception.notes && (
              <div className="p-4 border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Notas</p>
                <p className="font-medium text-sm">{transferReception.notes}</p>
              </div>
            )}
          </div>
        );
      }

      case "SALE": {
        const quotation = reference as OrderQuotationResource;

        return (
          <div className="space-y-4">
            {/* Información de la Cotización/Venta */}
            <div className="border rounded-lg">
              <div className="p-4 bg-muted/50 border-b">
                <h3 className="font-semibold text-sm">Detalles de la Venta</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">N° Cotización</p>
                  <p className="font-semibold">{quotation.quotation_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {format(new Date(quotation.quotation_date), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="font-semibold text-base">
                    {quotation.client.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {quotation.client.document_type}: {quotation.client.num_doc}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vehículo</p>
                  <p className="font-medium">{quotation.vehicle.plate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Moneda</p>
                  <p className="font-medium">
                    {quotation.type_currency.symbol}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subtotal</p>
                  <p className="font-medium">
                    {quotation.type_currency.symbol}{" "}
                    {quotation.subtotal.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">IGV</p>
                  <p className="font-medium">
                    {quotation.type_currency.symbol}{" "}
                    {quotation.tax_amount?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total a Pagar</p>
                  <p className="font-semibold text-lg text-green-600">
                    {quotation.type_currency.symbol}{" "}
                    {quotation.total_amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <Badge variant="default">{quotation.status}</Badge>
                </div>
              </div>
            </div>

            {quotation.observations && (
              <div className="p-4 border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">
                  Observaciones
                </p>
                <p className="font-medium text-sm">{quotation.observations}</p>
              </div>
            )}
          </div>
        );
      }

      case "ADJUSTMENT_OUT": {
        // Verificar si es WorkOrderPartsResource
        if ("work_order_correlative" in reference) {
          const workOrderPart = reference as WorkOrderPartsResource;

          return (
            <div className="border rounded-lg">
              <div className="p-4 bg-muted/50 border-b">
                <h3 className="font-semibold text-sm">
                  Detalles de Salida por Orden de Trabajo
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    N° Orden de Trabajo
                  </p>
                  <p className="font-semibold">
                    {workOrderPart.work_order_correlative}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">N° Grupo</p>
                  <p className="font-medium">{workOrderPart.group_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Producto</p>
                  <p className="font-medium">{workOrderPart.product_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Almacén</p>
                  <p className="font-medium">{workOrderPart.warehouse_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Cantidad Usada
                  </p>
                  <p className="font-semibold text-lg">
                    {workOrderPart.quantity_used}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Precio Unitario
                  </p>
                  <p className="font-medium">
                    S/ {workOrderPart.unit_price || "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Descuento</p>
                  <p className="font-medium">
                    {workOrderPart.discount_percentage}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-semibold text-lg">
                    S/ {workOrderPart.total_amount || "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Estado Entrega
                  </p>
                  <Badge
                    variant={workOrderPart.is_delivered ? "default" : "outline"}
                  >
                    {workOrderPart.is_delivered ? "ENTREGADO" : "PENDIENTE"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Registrado por
                  </p>
                  <p className="font-medium">
                    {workOrderPart.registered_by_name}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        // Verificar si es OrderQuotationResource
        if ("quotation_number" in reference) {
          const quotation = reference as OrderQuotationResource;

          return (
            <div className="space-y-4">
              <div className="border rounded-lg">
                <div className="p-4 bg-muted/50 border-b">
                  <h3 className="font-semibold text-sm">
                    Detalles de Salida por Cotización
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      N° Cotización
                    </p>
                    <p className="font-semibold">
                      {quotation.quotation_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="font-semibold">
                      {quotation.client.full_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vehículo</p>
                    <p className="font-medium">{quotation.vehicle.plate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-semibold text-lg">
                      {quotation.type_currency.symbol}{" "}
                      {quotation.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return null;
      }

      case "ADJUSTMENT_IN": {
        if (movement.reason_in_out) {
          return (
            <div className="border rounded-lg">
              <div className="p-4 bg-muted/50 border-b">
                <h3 className="font-semibold text-sm">
                  Detalles de Ajuste de Entrada
                </h3>
              </div>
              <div className="p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Motivo</p>
                  <p className="font-semibold">
                    {movement.reason_in_out.description}
                  </p>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">Código</p>
                  <p className="font-medium">{movement.reason_in_out.code}</p>
                </div>
              </div>
            </div>
          );
        }
        return null;
      }

      default:
        return null;
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalles del Movimiento"
      size="3xl"
    >
      <div className="space-y-6 mt-6">
        {/* Información General del Movimiento */}
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 border-b rounded-t-lg">
            <h3 className="font-semibold text-sm">Información General</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 px-4">
            <div>
              <p className="text-xs text-muted-foreground">N° Movimiento</p>
              <p className="font-semibold">{movement.movement_number}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="font-medium">
                {format(new Date(movement.movement_date), "dd/MM/yyyy HH:mm", {
                  locale: es,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cantidad Entrada</p>
              <p className="font-semibold text-green-600 text-lg">
                {movement.quantity_in}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cantidad Salida</p>
              <p className="font-semibold text-red-600 text-lg">
                {movement.quantity_out}
              </p>
            </div>
            {movement.user_name && (
              <div>
                <p className="text-xs text-muted-foreground">Usuario</p>
                <p className="font-medium">{movement.user_name}</p>
              </div>
            )}
            {movement.notes && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Observaciones</p>
                <p className="font-medium text-sm">{movement.notes}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Detalles de la Referencia */}
        {renderReferenceDetails()}
      </div>
    </GeneralSheet>
  );
}
