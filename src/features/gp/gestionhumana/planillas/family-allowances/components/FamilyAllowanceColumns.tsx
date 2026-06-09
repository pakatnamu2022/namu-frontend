"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FamilyAllowanceResource } from "../lib/family-allowance.interface";
import { Badge } from "@/components/ui/badge";

export type FamilyAllowanceColumns = ColumnDef<FamilyAllowanceResource>;

export const familyAllowanceColumns = (): FamilyAllowanceColumns[] => [
  {
    accessorKey: "num_doc",
    header: "DNI",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.worker?.vat ?? row.original.num_doc ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "full_name",
    header: "Trabajador",
    cell: ({ row }) => (
      <span className="font-semibold">
        {row.original.worker?.nombre_completo ?? row.original.full_name ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "period",
    header: "Periodo",
    cell: ({ row }) => (
      <span>
        {row.original.period?.description ?? row.original.period?.code ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ getValue }) => {
      const val = getValue() as number;
      return (
        <span className="font-mono">
          S/{" "}
          {val?.toLocaleString("es-PE", { minimumFractionDigits: 2 }) ?? "0.00"}
        </span>
      );
    },
  },
  {
    accessorKey: "applies",
    header: "Estado",
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge className="bg-green-600 hover:bg-green-700">Aplica</Badge>
      ) : (
        <Badge variant="outline">No aplica</Badge>
      ),
  },
];
