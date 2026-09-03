"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { formatPeriod } from "@/core/core.function";
import { ExclusionResource } from "../lib/exclusion.interface";
import { EXCLUSION_CONCEPTS } from "../lib/exclusion.constants";

export type ExclusionColumns = ColumnDef<ExclusionResource>;

const conceptLabel = (concept: string) => {
  const label = EXCLUSION_CONCEPTS.find((c) => c.value === concept)?.label;
  return typeof label === "string" ? label : concept;
};

export const exclusionColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): ExclusionColumns[] => [
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
    accessorKey: "worker.vat",
    header: "DNI",
    cell: ({ row }) => <span>{row.original.worker?.vat ?? "—"}</span>,
  },
  {
    accessorKey: "worker.nombre_completo",
    header: "Trabajador",
    cell: ({ row }) => (
      <span className="font-semibold">
        {row.original.worker?.nombre_completo ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "concept",
    header: "Concepto excluido",
    cell: ({ getValue }) => (
      <Badge variant="outline">{conceptLabel(getValue() as string)}</Badge>
    ),
  },
  {
    accessorKey: "reason",
    header: "Motivo",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value ? (
        <span className="text-wrap line-clamp-2">{value}</span>
      ) : (
        <Badge variant="outline">Sin motivo</Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <DeleteButton onClick={() => onDelete(row.original.id)} />
    ),
  },
];
