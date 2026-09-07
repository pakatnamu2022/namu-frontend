import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { OcsiInvoiceByVinRow } from "../lib/vehiclePurchaseOrder.interface";

export type OcsiInvoiceByVinColumn = ColumnDef<OcsiInvoiceByVinRow>;

function diff(current: string | null, next: string | null) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-muted-foreground line-through">
        {current || "—"}
      </span>{" "}
      <span className="font-medium">→ {next || "—"}</span>
    </span>
  );
}

export const ocsiInvoiceByVinColumns: OcsiInvoiceByVinColumn[] = [
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
    accessorKey: "oc_number",
    header: "OC",
    cell: ({ getValue }) => (getValue() as string) || "—",
  },
  {
    id: "emission_date",
    header: "Fecha emisión",
    cell: ({ row }) =>
      diff(row.original.current_emission_date, row.original.new_emission_date),
  },
  {
    id: "invoice",
    header: "Factura",
    cell: ({ row }) =>
      diff(row.original.current_invoice, row.original.new_invoice),
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
      return (
        <span className="inline-flex items-start gap-1 text-red-600">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{message || "Error"}</span>
        </span>
      );
    },
  },
];
