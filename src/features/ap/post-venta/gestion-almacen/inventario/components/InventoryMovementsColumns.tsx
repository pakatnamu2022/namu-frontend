import type { ColumnDef } from "@tanstack/react-table";
import { InventoryMovementResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventoryMovements.interface.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { translateMovementType } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.constants.ts";
import { ArrowDown, ArrowUp } from "lucide-react";
import InventoryMovementActions from "./InventoryMovementActions.tsx";
import { ReceptionResource } from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/lib/receptionsProducts.interface.ts";
import { ShipmentsReceptionsResource } from "@/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.interface.ts";
import { WorkOrderPartsResource } from "../../../taller/orden-trabajo-repuesto/lib/workOrderParts.interface.ts";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface.ts";
import { TransferReceptionResource } from "../../recepcion-transferencia/lib/transferReception.interface.ts";

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
        const formattedDate = format(new Date(date), "dd/MM/yyyy", {
          locale: es,
        });

        if (isInbound) {
          return (
            <div className="flex items-center gap-1 text-green-600">
              <ArrowUp className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          );
        }

        if (isOutbound) {
          return (
            <div className="flex items-center gap-1 text-red-600">
              <ArrowDown className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          );
        }

        return formattedDate;
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
      if (!reference && movement.reason_in_out) {
        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">Ajuste de inventario</span>
            <span className="text-xs text-gray-500">
              {movement.reason_in_out.description || "-"}
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
          return (
            <div className="flex flex-col text-sm">
              <span className="font-medium">{purchaseOrder.supplier}</span>
              <span className="text-xs text-gray-500">
                RUC: {purchaseOrder.supplier_num_doc}
              </span>
              <span className="text-xs text-gray-500">
                Factura: {purchaseOrder.invoice_number}
              </span>
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

        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">Destino: {destinationName}</span>
            <span className="text-xs text-gray-500">
              Guía: {documentNumber}
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
          transferReception.transfer_movement?.warehouse_origin;
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

      // SALE - Mostrar cliente de la cotización
      if (
        movementType === "SALE" &&
        referenceType?.includes("ApOrderQuotations")
      ) {
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

      // ADJUSTMENT_OUT - Puede ser por orden de trabajo o por cotización
      if (movementType === "ADJUSTMENT_OUT") {
        // Verificar si es WorkOrderPartsResource
        if ("work_order_correlative" in reference) {
          const workOrderPart = reference as WorkOrderPartsResource;

          return (
            <div className="flex flex-col text-sm">
              <span className="font-medium">
                OT: {workOrderPart.work_order_correlative}
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
        if (movement.reason_in_out) {
          return (
            <div className="flex flex-col text-sm">
              <span className="font-medium">Ajuste de inventario</span>
              <span className="text-xs text-gray-500">
                {movement.reason_in_out.description || "-"}
              </span>
            </div>
          );
        }
      }

      // ADJUSTMENT_IN con reason_in_out
      if (movementType === "ADJUSTMENT_IN" && movement.reason_in_out) {
        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">Ajuste de inventario</span>
            <span className="text-xs text-gray-500">
              {movement.reason_in_out.description || "-"}
            </span>
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
