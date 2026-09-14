import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MessageSquare, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, infoToast } from "@/core/core.function";
import type { AccountPayable } from "../lib/accountsPayable.interface";
import { Button } from "@/components/ui/button";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      infoToast(`Copiado: ${text}`, "");
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Copiar"
      className="ml-1 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
    >
      {copied ? (
        <Check className="size-3 text-green-600" />
      ) : (
        <Copy className="size-3" />
      )}
    </button>
  );
}

function formatAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return num.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface ColumnsOptions {
  onRowClick: (row: AccountPayable) => void;
  showComments?: boolean;
}

export function getAccountsPayableColumns({
  onRowClick,
  showComments = true,
}: ColumnsOptions): ColumnDef<AccountPayable>[] {
  return [
    {
      id: "documento",
      accessorKey: "documento",
      header: "Documento",
      cell: ({ row }) => (
        <div className="flex items-center gap-0.5">
          <button
            className="text-primary font-medium hover:underline text-left"
            onClick={() => onRowClick(row.original)}
          >
            {row.original.documento}
          </button>
          <CopyButton text={row.original.documento} />
        </div>
      ),
    },
    {
      id: "proveedor_nombre",
      accessorKey: "proveedor_nombre",
      enableSorting: true,
      header: "Proveedor",
      cell: ({ row }) => (
        <div className="max-w-[220px]">
          <p className="font-medium truncate">
            {row.original.proveedor_nombre || "-"}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.proveedor_documento}
          </p>
        </div>
      ),
    },
    {
      id: "fecha_documento",
      accessorKey: "fecha_documento",
      header: "Fecha Doc.",
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.fecha_documento),
    },
    {
      id: "fecha_contable",
      accessorKey: "fecha_contable",
      header: "Fecha Contable",
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.fecha_contable),
    },
    {
      id: "moneda",
      accessorKey: "moneda",
      header: "Moneda",
      cell: ({ row }) => (
        <Badge variant="ghost" color="muted" className="text-xs">
          {row.original.moneda}
        </Badge>
      ),
    },
    {
      id: "monto",
      accessorKey: "monto",
      header: "Monto",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-right block tabular-nums">
          {formatAmount(row.original.monto)}
        </span>
      ),
    },
    {
      id: "monto_sin_aplicar",
      accessorKey: "monto_sin_aplicar",
      header: "Saldo sin aplicar",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-right block tabular-nums font-semibold text-primary">
          {formatAmount(row.original.monto_sin_aplicar)}
        </span>
      ),
    },
    ...(showComments
      ? [
          {
            id: "actions",
            header: "Comentarios",
            cell: ({ row }) => {
              const count = row.original.comments_count ?? 0;
              return (
                <Button
                  size="sm"
                  variant="outline"
                  color="blue"
                  onClick={() => onRowClick(row.original)}
                >
                  <MessageSquare />
                  <span>{count}</span>
                </Button>
              );
            },
          } as ColumnDef<AccountPayable>,
        ]
      : []),
  ];
}
