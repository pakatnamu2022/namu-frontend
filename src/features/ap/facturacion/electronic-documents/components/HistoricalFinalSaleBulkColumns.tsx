import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, AlertCircle, MinusCircle } from "lucide-react";
import type { HistoricalFinalSaleBulkRow } from "../lib/electronicDocument.interface";

export type HistoricalFinalSaleBulkColumn = ColumnDef<HistoricalFinalSaleBulkRow>;

export const historicalFinalSaleBulkColumns: HistoricalFinalSaleBulkColumn[] = [
  {
    accessorKey: "row",
    header: "Fila",
  },
  {
    accessorKey: "vin",
    header: "VIN",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{(getValue() as string) || "—"}</span>
    ),
  },
  {
    accessorKey: "comprobante",
    header: "Comprobante",
    cell: ({ getValue }) => (getValue() as string) || "—",
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ getValue }) => (getValue() as string) || "—",
  },
  {
    accessorKey: "cliente",
    header: "Cliente",
    cell: ({ getValue }) => (
      <span className="text-xs">{(getValue() as string) || "—"}</span>
    ),
  },
  {
    accessorKey: "asesor",
    header: "Asesor",
    cell: ({ getValue }) => (
      <span className="text-xs">{(getValue() as string) || "—"}</span>
    ),
  },
  {
    accessorKey: "beneficio",
    header: "Margen (monto / %)",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{(getValue() as string) || "—"}</span>
    ),
  },
  {
    accessorKey: "total",
    header: "Factura · Precio venta",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{(getValue() as string) || "—"}</span>
    ),
  },
  {
    accessorKey: "quote_action",
    header: "Solicitud",
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">
        {(getValue() as string) || "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const { status, message } = row.original;
      if (status === "ok") {
        return (
          <span className="inline-flex items-center gap-1 text-green-700">
            <CheckCircle2 className="size-4" /> Listo
          </span>
        );
      }
      if (status === "skipped") {
        return (
          <span className="inline-flex items-start gap-1 text-muted-foreground">
            <MinusCircle className="mt-0.5 size-4 shrink-0" />
            <span>{message || "Omitido"}</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-start gap-1 text-red-600">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{message || "Error"}</span>
        </span>
      );
    },
  },
];
