import type { ColumnDef } from "@tanstack/react-table";
import {
  CreditNoteResource,
  InventoryMovementResource,
} from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventoryMovements.interface.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { translateMovementType } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.constants.ts";
import { ArrowDown, ArrowUp, RotateCcw, XCircle } from "lucide-react";
import InventoryMovementActions from "./InventoryMovementActions.tsx";
import { ReceptionResource } from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/lib/receptionsProducts.interface.ts";
import { ShipmentsReceptionsResource } from "@/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.interface.ts";
import { WorkOrderPartsResource } from "../../../taller/orden-trabajo-repuesto/lib/workOrderParts.interface.ts";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface.ts";
import { TransferReceptionResource } from "../../recepcion-transferencia/lib/transferReception.interface.ts";
import { formatDate } from "@/core/core.function.ts";

export type InventoryMovementColumns = ColumnDef<InventoryMovementResource>;

export const inventoryMovementsColumns = (): InventoryMovementColumns[] => [
  {
    accessorKey: "movement_date",
    header: "Fecha",
    cell: ({ row, getValue }) => {
      const date = getValue() as string;
      const isInbound = row.original.is_inbound;
      const isOutbound = row.original.is_outbound;

      if (!date) return "-";

      try {
        if (isInbound) {
          return (
            <div className="flex items-center gap-1 text-green-600">
              <ArrowUp className="h-4 w-4" />
              <span>{formatDate(date)}</span>
            </div>
          );
        }

        if (isOutbound) {
          return (
            <div className="flex items-center gap-1 text-red-600">
              <ArrowDown className="h-4 w-4" />
              <span>{formatDate(date)}</span>
            </div>
          );
        }

        return formatDate(date);
      } catch {
        return date;
      }
    },
  },
  {
    accessorKey: "movement_type",
    header: "Tipo de Movimiento",
    cell: ({ getValue }) => {
      const type = getValue() as string;
      return (
        <Badge variant="outline" className="whitespace-nowrap">
          {translateMovementType(type)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "movement_number",
    header: "N° Movimiento",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    id: "document_entity",
    header: "Documento | Entidad",
    cell: ({ row }) => {
      const movement = row.original;
      const reference = movement.reference;
      const referenceType = movement.reference_type;
      const movementType = movement.movement_type;

      // Si no hay referencia, verificar si hay reason_in_out para ajustes
      if (!reference && movement.movement_number_dyn) {
        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">Ajuste de inventario</span>
            <span className="text-xs text-gray-500">
              {movement.movement_number_dyn || "-"}
            </span>
          </div>
        );
      }

      // Si no hay referencia, retornar "-"
      if (!reference) return "-";

      // PURCHASE_RECEPTION - Mostrar proveedor, RUC y factura
      if (
        movementType === "PURCHASE_RECEPTION" ||
        referenceType?.includes("PurchaseReception")
      ) {
        const reception = reference as ReceptionResource;
        const purchaseOrder = reception.purchase_order;

        if (purchaseOrder) {
          const hasCreditNote = purchaseOrder.credit_note_dynamics != null;
          const invoiceDynLabel =
            purchaseOrder.invoice_dynamics ??
            `${purchaseOrder.invoice_series}-${purchaseOrder.invoice_number}`;
          const invoiceLabel = `${purchaseOrder.invoice_series}-${purchaseOrder.invoice_number}`;

          // status=false → NC por corrección (factura anulada), status=true → NC por devolución (factura sigue vigente)
          const isCorrectionNote =
            hasCreditNote && purchaseOrder.status === false;
          const isReturnNote = hasCreditNote && purchaseOrder.status === true;

          return (
            <div className="flex flex-col text-sm">
              <span className="font-medium">{purchaseOrder.supplier}</span>
              <span className="text-xs text-gray-500">
                RUC: {purchaseOrder.supplier_num_doc}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Factura: {invoiceLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Dyn : {invoiceDynLabel}</span>
                {isCorrectionNote && (
                  <Badge variant="outline" color="red">
                    NC Corrección
                  </Badge>
                )}
                {isReturnNote && (
                  <Badge variant="outline" color="orange">
                    NC Devolución
                  </Badge>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">{reception.supplier_name}</span>
            <span className="text-xs text-gray-500">
              RUC: {reception.supplier_num_doc}
            </span>
          </div>
        );
      }

      // TRANSFER_OUT - Mostrar almacén destino y guía de remisión
      if (
        movementType === "TRANSFER_OUT" ||
        referenceType?.includes("ShipmentsReceptions")
      ) {
        const shipment = reference as ShipmentsReceptionsResource;
        const destinationName =
          shipment.receiver_establishment?.description ||
          shipment.receiver_name ||
          "-";
        const documentNumber = shipment.document_number || "-";
        const isAnnulled = shipment.is_annulled;

        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">Destino: {destinationName}</span>
            <span className="text-xs text-gray-500">
              Guía: {documentNumber}
              {isAnnulled && "*"}
            </span>
          </div>
        );
      }

      // TRANSFER_IN - Mostrar almacén origen y guía de remisión
      if (
        movementType === "TRANSFER_IN" ||
        referenceType?.includes("TransferReception")
      ) {
        const transferReception = reference as TransferReceptionResource;
        const warehouseOrigin =
          transferReception.shipping_guide.transmitter_establishment;
        const shippingGuide = transferReception.shipping_guide;

        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">
              Origen: {warehouseOrigin?.description || "-"}
            </span>
            {shippingGuide?.document_number && (
              <span className="text-xs text-gray-500">
                Guía: {shippingGuide.document_number}
              </span>
            )}
          </div>
        );
      }

      // SALE - Mostrar cliente desde el documento electrónico (ApWorkOrder)
      if (movementType === "SALE" && referenceType?.includes("ApWorkOrder")) {
        const electronicDoc = movement.electronic_document;
        const isCancelled = electronicDoc?.status === "cancelled";

        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">
              {electronicDoc?.cliente_denominacion ?? "-"}
            </span>
            <span className="text-xs text-gray-500">
              RUC: {electronicDoc?.cliente_numero_de_documento ?? "-"}
            </span>
            {electronicDoc?.full_number && (
              <div
                className={`flex items-center gap-1.5 text-xs ${isCancelled ? "text-red-500" : "text-gray-500"}`}
              >
                {isCancelled && (
                  <XCircle className="h-3 w-3 text-red-500 shrink-0" />
                )}
                <span>Factura: {electronicDoc.full_number}</span>
                {electronicDoc.credit_note_id && (
                  <span className="text-red-400 font-medium">
                    · NC {electronicDoc.credit_note_number}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      }

      // SALE - Mostrar cliente de la cotización
      if (
        movementType === "SALE" &&
        referenceType?.includes("ApOrderQuotations")
      ) {
        const electronicDoc = movement.electronic_document;
        const isCancelled = electronicDoc?.status === "cancelled";

        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">
              {electronicDoc?.cliente_denominacion ?? "-"}
            </span>
            <span className="text-xs text-gray-500">
              RUC: {electronicDoc?.cliente_numero_de_documento ?? "-"}
            </span>
            {electronicDoc?.full_number && (
              <div
                className={`flex items-center gap-1.5 text-xs ${isCancelled ? "text-red-500" : "text-gray-500"}`}
              >
                {isCancelled && (
                  <XCircle className="h-3 w-3 text-red-500 shrink-0" />
                )}
                <span>Factura: {electronicDoc.full_number}</span>
                {electronicDoc.credit_note_id && (
                  <span className="text-red-400 font-medium">
                    · NC {electronicDoc.credit_note_number}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      }

      // ADJUSTMENT_OUT - Puede ser por orden de trabajo o por cotización
      if (movementType === "ADJUSTMENT_OUT") {
        // Verificar si es WorkOrderPartsResource
        if ("work_order_correlative" in reference) {
          const workOrderPart = reference as WorkOrderPartsResource;

          return (
            <div className="flex flex-col text-sm">
              <span className="font-medium">
                {workOrderPart.work_order_correlative}
              </span>
              <span className="text-xs text-gray-500">
                Requerimiento de taller
              </span>
            </div>
          );
        }

        // Verificar si es OrderQuotationResource
        if ("quotation_number" in reference) {
          const quotation = reference as OrderQuotationResource;

          return (
            <div className="flex flex-col text-sm">
              <span className="font-medium">{quotation.client.full_name}</span>
              <span className="text-xs text-gray-500">
                Cotización: {quotation.quotation_number}
              </span>
            </div>
          );
        }

        // Si tiene reason_in_out, mostrar como ajuste
        if (movement.movement_number_dyn) {
          return (
            <div className="flex flex-col text-sm">
              <span className="font-medium">Ajuste de inventario</span>
              <span className="text-xs text-gray-500">
                {movement.movement_number_dyn || "-"}
              </span>
            </div>
          );
        }
      }

      // ADJUSTMENT_IN con reason_in_out
      if (movementType === "ADJUSTMENT_IN" && movement.movement_number_dyn) {
        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">Ajuste de inventario</span>
            <span className="text-xs text-gray-500">
              {movement.movement_number_dyn || "-"}
            </span>
          </div>
        );
      }

      if (movementType === "RETURN_IN") {
        const electronicDoc = movement.electronic_document;
        const isCancelled = electronicDoc?.status === "cancelled";

        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">
              {electronicDoc?.cliente_denominacion ?? "-"}
            </span>
            <span className="text-xs text-gray-500">
              RUC: {electronicDoc?.cliente_numero_de_documento ?? "-"}
            </span>
            {electronicDoc?.full_number && (
              <div
                className={`flex items-center gap-1.5 text-xs ${isCancelled ? "text-red-500" : "text-gray-500"}`}
              >
                {isCancelled && (
                  <RotateCcw className="h-3 w-3 text-red-500 shrink-0" />
                )}
                <span>Factura: {electronicDoc.full_number}</span>
              </div>
            )}
          </div>
        );
      }

      // SALE - Mostrar cliente de la cotización
      if (movementType === "RETURN_OUT") {
        const creditNote = reference as CreditNoteResource;

        const invoiceDynLabel =
          creditNote.purchase_order.invoice_dynamics ??
          `${creditNote.purchase_order.invoice_series}-${creditNote.purchase_order.invoice_number}`;
        const invoiceLabel = `${creditNote.purchase_order.invoice_series}-${creditNote.purchase_order.invoice_number}`;

        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">
              {creditNote.purchase_order.supplier}
            </span>
            <span className="text-xs text-gray-500">
              RUC: {creditNote.purchase_order.supplier_num_doc}
            </span>
            <span className="text-xs text-gray-500">
              Factura: {invoiceLabel}
            </span>
            <span className="text-xs text-gray-500">
              Nota de Crédito: {creditNote.credit_note_number}
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Dyn : {invoiceDynLabel}</span>
            </div>
          </div>
        );
      }

      return "-";
    },
  },
  {
    accessorKey: "warehouse_origin",
    header: "Almacén Origen",
    cell: ({ row }) => {
      const warehouseOrigin = row.original.warehouse_origin;

      if (!warehouseOrigin) return "-";

      if (typeof warehouseOrigin === "object") {
        return (
          <div className="flex flex-col">
            <span>{warehouseOrigin.description}</span>
            {warehouseOrigin.dyn_code && (
              <span className="text-xs text-gray-500">
                {warehouseOrigin.dyn_code}
              </span>
            )}
          </div>
        );
      }

      return warehouseOrigin;
    },
  },
  {
    accessorKey: "warehouse_destination",
    header: "Almacén Destino",
    cell: ({ row }) => {
      const warehouseDestination = row.original.warehouse_destination;

      if (!warehouseDestination) return "-";

      if (typeof warehouseDestination === "object") {
        return (
          <div className="flex flex-col">
            <span>{warehouseDestination.description}</span>
            {warehouseDestination.dyn_code && (
              <span className="text-xs text-gray-500">
                {warehouseDestination.dyn_code}
              </span>
            )}
          </div>
        );
      }

      return warehouseDestination;
    },
  },
  {
    accessorKey: "user_name",
    header: "Usuario",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    accessorKey: "notes",
    header: "Observaciones",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      return (
        <span className="text-sm text-muted-foreground truncate max-w-xs block">
          {value}
        </span>
      );
    },
  },
  {
    accessorKey: "quantity_in",
    header: "Cant. Ingresada",
  },
  {
    accessorKey: "quantity_out",
    header: "Cant. Salida",
  },
  {
    accessorKey: "balance",
    header: "Saldo",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const movement = row.original;
      return <InventoryMovementActions movement={movement} />;
    },
  },
];
