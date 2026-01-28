import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw, X } from "lucide-react";
import { VehiclePurchaseOrderResource } from "../lib/vehiclePurchaseOrder.interface";
import VehiclePurchaseOrderMigrationHistory from "./VehiclePurchaseOrderMigrationHistory";
import VehiclePurchaseOrderDetailButton from "./VehiclePurchaseOrderDetailButton";

export type VehiclePurchaseOrderColumns =
  ColumnDef<VehiclePurchaseOrderResource>;

export const vehiclePurchaseOrderColumns =
  (): VehiclePurchaseOrderColumns[] => [
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => {
        const value = getValue() as boolean;
        return value ? (
          <Badge
            tooltip="Válida"
            className="border-0 py-0 h-6 flex justify-center items-center w-fit px-2 gap-2 text-xs"
          >
            <Check className="h-4 w-4" />
            <span>Válida</span>
          </Badge>
        ) : (
          <Badge
            color="secondary"
            tooltip="Anulada"
            tooltipVariant="secondary"
            className="border-0 h-6 p-0 flex justify-center items-center w-fit px-2 gap-2 text-xs"
          >
            <X className="h-4 w-4" />
            <span>Anulada</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "number",
      header: "Nro. Orden",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          value && (
            <Badge variant="outline" className="font-mono text-sm font-normal">
              {value}
            </Badge>
          )
        );
      },
    },
    {
      accessorKey: "emission_date",
      header: "Fecha Emisión",
    },
    {
      accessorKey: "number_guide",
      header: "Nro. Guía",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          value && (
            <Badge variant="outline" className="font-mono text-sm font-normal">
              {value}
            </Badge>
          )
        );
      },
    },
    {
      accessorKey: "invoice_dynamics",
      header: "Factura Dynamics",
    },
    {
      accessorKey: "receipt_dynamics",
      header: "Recibo Dynamics",
    },
    {
      accessorKey: "credit_note_dynamics",
      header: "Nota de Crédito",
    },
    {
      accessorKey: "supplier",
      header: "Proveedor",
    },
    {
      accessorKey: "invoice_series",
      header: "Serie",
    },
    {
      accessorKey: "invoice_number",
      header: "Factura",
    },
    {
      accessorKey: "subtotal",
      header: "Subtotal",
      cell: ({ row }) => {
        const subtotal = row.original.subtotal;
        const currency = row.original.currency_code || "";
        return (
          <p className="font-medium">
            {currency} {Number(subtotal).toFixed(2)}
          </p>
        );
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const total = row.original.total;
        const currency = row.original.currency_code || "";
        return (
          <p className="font-semibold">
            {currency} {Number(total).toFixed(2)}
          </p>
        );
      },
    },
    {
      accessorKey: "warehouse",
      header: "Almacén",
    },
    {
      accessorKey: "sede",
      header: "Sede",
    },
    {
      accessorKey: "creator.name",
      header: "Creado Por",
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        return value || "N/A";
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const router = useNavigate();
        const purchaseOrder = row.original;
        const { id } = purchaseOrder;

        // Check if resend button should be shown
        const canResend =
          !purchaseOrder.status &&
          purchaseOrder.credit_note_dynamics &&
          purchaseOrder.migration_status === "updated_with_nc" &&
          purchaseOrder.resent === false;

        return (
          <div className="flex items-center gap-2">
            {/* View Detail */}
            <VehiclePurchaseOrderDetailButton purchaseOrder={purchaseOrder} />

            {/* Migration History */}
            <VehiclePurchaseOrderMigrationHistory purchaseOrderId={id} />

            {/* Resend (only if conditions are met) */}
            {canResend && (
              <Button
                variant="default"
                size="icon"
                className="size-7"
                tooltip="Reenviar Orden de Compra"
                onClick={() => router(`compra-vehiculo-nuevo/reenviar/${id}`)}
              >
                <RefreshCw className="size-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];
