import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Check, RefreshCw, Search, X } from "lucide-react";
import { VehiclePurchaseOrderResource } from "../lib/vehiclePurchaseOrder.interface";
import VehiclePurchaseOrderMigrationHistory from "./VehiclePurchaseOrderMigrationHistory";
import VehiclePurchaseOrderDetailButton from "./VehiclePurchaseOrderDetailButton";
import { VEHICLE_PURCHASE_ORDER } from "../lib/vehiclePurchaseOrder.constants";
import MigrationStatusBadge from "@/features/ap/facturacion/electronic-documents/components/MigrationStatusBadge";

export type VehiclePurchaseOrderColumns =
  ColumnDef<VehiclePurchaseOrderResource>;

interface Props {
  onRequestCreditNote: (purchaseOrderId: number) => void;
  onRequestInvoice: (purchaseOrderId: number) => void;
  onMigrate?: (id: number) => void;
}

export const vehiclePurchaseOrderColumns = ({
  onRequestCreditNote,
  onRequestInvoice,
  onMigrate,
}: Props): VehiclePurchaseOrderColumns[] => [
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
    accessorKey: "emission_date",
    header: "Fecha Emisión",
  },
  {
    accessorKey: "invoice_dynamics",
    header: "Factura Dynamics",
    cell: ({ row }) => {
      const value = row.original.invoice_dynamics;
      return value ? (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-sm font-normal">
            {value}
          </Badge>
          <Button
            variant="outline"
            size="icon-xs"
            color="orange"
            onClick={() => onRequestInvoice(row.original.id)}
          >
            <Search />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="xs"
          color="orange"
          onClick={() => onRequestInvoice(row.original.id)}
        >
          <Search />
          Consultar
        </Button>
      );
    },
  },
  {
    accessorKey: "receipt_dynamics",
    header: "Recibo Dynamics",
  },
  {
    accessorKey: "credit_note_dynamics",
    header: "Nota de Crédito",
    cell: ({ row }) => {
      const value = row.original.credit_note_dynamics;
      return value ? (
        <Badge variant="outline" className="font-mono text-sm font-normal">
          {value}
        </Badge>
      ) : (
        <Button
          variant="outline"
          size="xs"
          color="indigo"
          onClick={() => onRequestCreditNote(row.original.id)}
        >
          <Search />
          Consultar
        </Button>
      );
    },
  },
  {
    accessorKey: "supplier",
    header: "Proveedor",
  },
  {
    accessorKey: "invoice",
    header: "Factura",
    cell: ({ row }) => {
      const invoice =
        row.original.invoice_series + "-" + row.original.invoice_number;
      return (
        <Badge variant="outline" className="font-mono text-sm font-normal">
          {invoice}
        </Badge>
      );
    },
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
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return value ? (
        <Badge tooltip="Válida" icon={Check} color="green" variant="outline">
          <span>Válida</span>
        </Badge>
      ) : (
        <Badge
          color="red"
          variant="outline"
          tooltip="Anulada"
          tooltipVariant="secondary"
          icon={X}
        >
          <span>Anulada</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "migration_status",
    header: "Estado Migración",
    cell: ({ getValue }) => {
      return <MigrationStatusBadge migration_status={getValue() as string} />;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const purchaseOrder = row.original;
      const { id } = purchaseOrder;
      const { ABSOLUTE_ROUTE } = VEHICLE_PURCHASE_ORDER;

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

          {/* Migrar */}
          {onMigrate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Migrar"
              onClick={() => onMigrate(id)}
            >
              <ArrowRightLeft className="size-4" />
            </Button>
          )}

          {/* Resend (only if conditions are met) */}
          {canResend && (
            <Button
              variant="default"
              size="icon"
              className="size-7"
              tooltip="Reenviar Orden de Compra"
              onClick={() => router(`${ABSOLUTE_ROUTE}/reenviar/${id}`)}
            >
              <RefreshCw className="size-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
