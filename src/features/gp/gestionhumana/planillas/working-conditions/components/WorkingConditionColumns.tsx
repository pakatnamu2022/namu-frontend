"use client";

import { ColumnDef } from "@tanstack/react-table";
import { WorkingConditionResource } from "../lib/working-condition.interface";

export type WorkingConditionColumns = ColumnDef<WorkingConditionResource>;

export const workingConditionColumns = (): WorkingConditionColumns[] => [
  {
    accessorKey: "worker",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-semibold">{(getValue() as string) ?? "—"}</span>
    ),
  },
  {
    accessorKey: "period",
    header: "Periodo",
    cell: ({ getValue }) => <span>{(getValue() as string) ?? "—"}</span>,
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
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => <span>{(getValue() as string) ?? "—"}</span>,
  },
  {
    accessorKey: "created_at",
    header: "Fecha Creación",
    cell: ({ getValue }) => {
      const val = getValue() as string | null;
      if (!val) return <span>—</span>;
      return (
        <span className="text-sm">
          {new Date(val).toLocaleDateString("es-PE")}
        </span>
      );
    },
  },
];
