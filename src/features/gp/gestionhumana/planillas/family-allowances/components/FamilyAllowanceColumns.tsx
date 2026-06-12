"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FamilyAllowanceResource } from "../lib/family-allowance.interface";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatPeriod } from "@/core/core.function";

export type FamilyAllowanceColumns = ColumnDef<FamilyAllowanceResource>;

export const familyAllowanceColumns = (): FamilyAllowanceColumns[] => [
  {
    accessorKey: "period",
    header: "Periodo",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
        {formatPeriod(row.original.period)}
      </span>
    ),
  },
  {
    accessorKey: "num_doc",
    header: "DNI",
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
    accessorKey: "amount",
    header: "Monto",
    cell: ({ getValue }) => {
      const val = getValue() as number;
      return formatMoney(val);
    },
  },
  {
    accessorKey: "applies",
    header: "Estado",
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="outline" color="green">
          Aplica
        </Badge>
      ) : (
        <Badge variant="outline" color="gray">
          No aplica
        </Badge>
      ),
  },
];
