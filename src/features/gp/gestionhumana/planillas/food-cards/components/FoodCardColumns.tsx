"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FoodCardResource } from "../lib/food-card.interface";
import { Badge } from "@/components/ui/badge";
import { formatPeriod } from "@/core/core.function";

export type FoodCardColumns = ColumnDef<FoodCardResource>;

export const foodCardColumns = (): FoodCardColumns[] => [
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
