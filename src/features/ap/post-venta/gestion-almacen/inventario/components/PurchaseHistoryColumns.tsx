import type { ColumnDef } from "@tanstack/react-table";
import { PurchaseHistoryItem } from "../lib/inventoryMovements.interface.ts";
import { formatDate } from "@/core/core.function.ts";

export type PurchaseHistoryColumns = ColumnDef<PurchaseHistoryItem>;

export const purchaseHistoryColumns = (): PurchaseHistoryColumns[] => [
  {
    accessorKey: "reception_date",
    header: "Fecha Recepción",
    enableSorting: false,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (!date) return "-";
      try {
        return formatDate(date);
      } catch {
        return date;
      }
    },
  },
  {
    accessorKey: "reception_number",
    header: "N° Recepción",
    enableSorting: false,
  },
  {
    accessorKey: "purchase_order.number",
    header: "N° Orden Compra",
    enableSorting: false,
  },
  {
    id: "invoice",
    header: "Factura",
    enableSorting: false,
    cell: ({ row }) => {
      const po = row.original.purchase_order;
      if (!po?.invoice_series || !po?.invoice_number) return "-";
      return `${po.invoice_series}-${po.invoice_number}`;
    },
  },
  {
    accessorKey: "supplier.name",
    header: "Proveedor",
    enableSorting: false,
  },
  {
    accessorKey: "quantity_received",
    header: "Cantidad",
    enableSorting: false,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return parseFloat(value || "0").toFixed(2);
    },
  },
  {
    id: "unit_price_display",
    header: "Precio Unitario",
    enableSorting: false,
    cell: ({ row }) => {
      const currency = row.original.currency?.symbol || "$";
      const value = row.original.unit_price;
      return `${currency} ${parseFloat(value || "0").toFixed(2)}`;
    },
  },
  {
    id: "total_line_display",
    header: "Total",
    enableSorting: false,
    cell: ({ row }) => {
      const currency = row.original.currency?.symbol || "$";
      const value = row.original.total_line;
      return `${currency} ${parseFloat(value || "0").toFixed(2)}`;
    },
  },
  {
    accessorKey: "received_by",
    header: "Recibido Por",
    enableSorting: false,
  },
];
