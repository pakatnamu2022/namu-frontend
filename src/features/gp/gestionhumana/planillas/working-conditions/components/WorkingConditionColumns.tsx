"use client";

import { ColumnDef } from "@tanstack/react-table";
import { WorkingConditionResource } from "../lib/working-condition.interface";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatPeriod } from "@/core/core.function";

export type WorkingConditionColumns = ColumnDef<WorkingConditionResource>;

export const workingConditionColumns = (): WorkingConditionColumns[] => [
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
    accessorKey: "worker",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-semibold">{(getValue() as string) ?? "—"}</span>
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
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="outline" color="green">
          Activo
        </Badge>
      ) : (
        <Badge variant="outline" color="gray">
          Inactivo
        </Badge>
      ),
  },
];
