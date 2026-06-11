import type { ColumnDef } from "@tanstack/react-table";
import { PurchaseHistoryItem } from "../lib/inventoryMovements.interface.ts";
import { formatDate } from "@/core/core.function.ts";

export type PurchaseHistoryColumns = ColumnDef<PurchaseHistoryItem>;

const isSoles = (item: PurchaseHistoryItem) =>
  item.currency?.symbol === "S/" ||
  item.currency?.name?.toLowerCase().includes("sol");

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
    id: "currency",
    header: "Moneda",
    enableSorting: false,
    cell: ({ row }) => {
      const currency = row.original.currency;
      if (!currency) return "-";
      return (
        <div>
          <span className="text-muted-foreground capitalize">
            {currency.name.charAt(0) + currency.name.slice(1).toLowerCase()}
          </span>
        </div>
      );
    },
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
      const item = row.original;
      const inSoles = isSoles(item);
      const symbol = item.currency?.symbol || "$";
      const originalPrice = parseFloat(item.unit_price || "0").toFixed(2);
      const exchangeRate = parseFloat(item.exchange_rate || "0");

      return (
        <div className="text-right">
          <p className="font-medium text-sm">
            S/ {item.unit_price_pen.toFixed(2)}
          </p>
          {!inSoles && exchangeRate > 0 && (
            <p className="text-xs text-muted-foreground">
              {symbol} {originalPrice} · TC {exchangeRate.toFixed(3)}
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: "total_line_display",
    header: "Total",
    enableSorting: false,
    cell: ({ row }) => {
      const item = row.original;
      const inSoles = isSoles(item);
      const symbol = item.currency?.symbol || "$";
      const originalTotal = parseFloat(item.total_line || "0").toFixed(2);
      const exchangeRate = parseFloat(item.exchange_rate || "0");

      return (
        <div className="text-right">
          <p className="font-medium text-sm">
            S/ {item.total_line_pen.toFixed(2)}
          </p>
          {!inSoles && exchangeRate > 0 && (
            <p className="text-xs text-muted-foreground">
              {symbol} {originalTotal}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "received_by",
    header: "Recibido Por",
    enableSorting: false,
  },
];
