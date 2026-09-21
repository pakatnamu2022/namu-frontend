"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/core/core.function";
import { SctrRateResource } from "../lib/sctr-rate.interface";

export type SctrRateColumns = ColumnDef<SctrRateResource>;

// La API guarda la tasa como fracción (0.005); se muestra como porcentaje (0.5%).
export const formatRate = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === ""
    ? "—"
    : `${(Number(value) * 100).toFixed(4).replace(/\.?0+$/, "")}%`;

export const sctrRateColumns = (): SctrRateColumns[] => [
  {
    accessorKey: "company",
    header: "Empresa",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.company ?? "—"}</span>
    ),
  },
  {
    accessorKey: "health_rate",
    header: "Tasa Salud",
    cell: ({ row }) => <span>{formatRate(row.original.health_rate)}</span>,
  },
  {
    accessorKey: "pension_rate",
    header: "Tasa Pensión",
    cell: ({ row }) => <span>{formatRate(row.original.pension_rate)}</span>,
  },
  {
    accessorKey: "effective_from",
    header: "Vigente desde",
    cell: ({ row }) => <span>{formatDate(row.original.effective_from)}</span>,
  },
  {
    accessorKey: "effective_to",
    header: "Vigente hasta",
    cell: ({ row }) => (
      <span>
        {row.original.effective_to
          ? formatDate(row.original.effective_to)
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "is_current",
    header: "Estado",
    cell: ({ row }) =>
      row.original.is_current ? (
        <Badge color="green">Vigente</Badge>
      ) : (
        <Badge variant="outline">Anterior</Badge>
      ),
  },
];
