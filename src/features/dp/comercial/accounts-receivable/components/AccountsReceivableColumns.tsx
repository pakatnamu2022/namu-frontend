import type { ColumnDef } from "@tanstack/react-table";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/core/core.function";
import type { AccountReceivable } from "../lib/accountsReceivable.interface";
import {
  OVERDUE_STATUS_COLORS,
  DEFAULT_OVERDUE_STATUS_COLOR,
} from "../lib/accountsReceivable.constants";
import { cn } from "@/lib/utils";

function formatAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return num.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface ColumnsOptions {
  onRowClick: (row: AccountReceivable) => void;
}

export function getAccountsReceivableColumns({
  onRowClick,
}: ColumnsOptions): ColumnDef<AccountReceivable>[] {
  return [
    {
      id: "document_number",
      accessorKey: "document_number",
      header: "Documento",
      cell: ({ row }) => (
        <button
          className="text-primary font-medium hover:underline text-left"
          onClick={() => onRowClick(row.original)}
        >
          {row.original.document_number}
        </button>
      ),
    },
    {
      id: "client_name",
      accessorKey: "client_name",
      header: "Cliente",
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <p className="font-medium truncate">{row.original.client_name}</p>
          <p className="text-xs text-muted-foreground">{row.original.client_id}</p>
        </div>
      ),
    },
    {
      id: "seller",
      accessorKey: "seller",
      header: "Vendedor",
      cell: ({ row }) => row.original.seller || "-",
    },
    {
      id: "sede",
      header: "Sede",
      cell: ({ row }) => row.original.sede?.localidad ?? row.original.branch ?? "-",
    },
    {
      id: "document_date",
      accessorKey: "document_date",
      header: "Fecha Doc.",
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.document_date),
    },
    {
      id: "document_due_date",
      accessorKey: "document_due_date",
      header: "Vencimiento",
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.document_due_date),
    },
    {
      id: "overdue_days",
      accessorKey: "overdue_days",
      header: "Días Venc.",
      enableSorting: true,
      cell: ({ row }) => {
        const days = row.original.overdue_days;
        return (
          <span className={cn("font-medium", days > 0 ? "text-red-600" : "text-green-600")}>
            {days}
          </span>
        );
      },
    },
    {
      id: "overdue_status",
      accessorKey: "overdue_status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.overdue_status;
        const colorClass = OVERDUE_STATUS_COLORS[status] ?? DEFAULT_OVERDUE_STATUS_COLOR;
        return (
          <Badge variant="outline" className={cn("text-xs border", colorClass)}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "currency",
      accessorKey: "currency",
      header: "Moneda",
      cell: ({ row }) => (
        <Badge variant="ghost" color="muted" className="text-xs">
          {row.original.currency}
        </Badge>
      ),
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: "Importe",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-right block tabular-nums">
          {formatAmount(row.original.amount)}
        </span>
      ),
    },
    {
      id: "balance",
      accessorKey: "balance",
      header: "Saldo",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-right block tabular-nums font-semibold text-primary">
          {formatAmount(row.original.balance)}
        </span>
      ),
    },
    {
      id: "balance_pen",
      accessorKey: "balance_pen",
      header: "Saldo PEN",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-right block tabular-nums font-semibold text-primary">
          {formatAmount(row.original.balance_pen)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Comentarios",
      cell: ({ row }) => {
        const count = row.original.comments_count ?? 0;
        return (
          <button
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => onRowClick(row.original)}
          >
            <MessageSquare className="size-4" />
            <span className="text-xs">{count}</span>
          </button>
        );
      },
    },
  ];
}
