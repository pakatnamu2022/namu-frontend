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
    header: "Factura / NC",
    enableSorting: false,
    cell: ({ row }) => {
      const po = row.original.purchase_order;
      const creditNotes = row.original.credit_notes ?? [];
      const invoiceLabel =
        po?.invoice_series && po?.invoice_number
          ? `${po.invoice_series}-${po.invoice_number}`
          : null;

      return (
        <div className="space-y-1">
          {invoiceLabel ? (
            <p className="text-sm font-medium">{invoiceLabel}</p>
          ) : (
            <p className="text-sm text-muted-foreground">-</p>
          )}
          {creditNotes.map((nc) => {
            const totalQty = nc.details.reduce(
              (acc, d) => acc + parseFloat(d.quantity || "0"),
              0,
            );
            return (
              <div
                key={nc.credit_note_number}
                className="flex items-center gap-1.5 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5"
              >
                <span className="text-xs text-amber-800 font-medium truncate">
                  {nc.credit_note_number}
                </span>
                <span className="ml-auto text-xs text-amber-700 whitespace-nowrap">
                  -
                  {totalQty % 1 === 0
                    ? totalQty.toFixed(0)
                    : totalQty.toFixed(2)}{" "}
                  u.
                </span>
              </div>
            );
          })}
        </div>
      );
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
    id: "quantity",
    header: "Cantidad",
    enableSorting: false,
    cell: ({ row }) => {
      const item = row.original;
      const ordered = parseFloat(item.quantity_ordered || "0");
      const received = parseFloat(item.quantity_received || "0");
      const creditNotes = item.credit_notes ?? [];
      const creditedQty = creditNotes.reduce(
        (acc, nc) =>
          acc +
          nc.details.reduce((a, d) => a + parseFloat(d.quantity || "0"), 0),
        0,
      );
      const missing = ordered - received;
      const hasCredit = creditedQty > 0;

      const fmt = (n: number) => (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2));

      return (
        <div className="space-y-0.5 text-right">
          <p className="text-xs text-muted-foreground">
            Pedido:{" "}
            <span className="font-medium text-foreground">{fmt(ordered)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Recibido:{" "}
            <span className="font-medium text-foreground">{fmt(received)}</span>
          </p>
          {missing > 0 && !hasCredit && (
            <p className="text-xs text-muted-foreground">
              Faltante:{" "}
              <span className="font-medium text-amber-600">{fmt(missing)}</span>
            </p>
          )}
          {missing > 0 && hasCredit && (
            <p className="text-xs text-muted-foreground">
              Faltante:{" "}
              <span className="font-medium text-green-700">
                {fmt(missing)} (NC)
              </span>
            </p>
          )}
        </div>
      );
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
