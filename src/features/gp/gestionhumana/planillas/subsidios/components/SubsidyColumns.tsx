"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { formatDate } from "@/core/core.function";
import { SubsidyResource } from "../lib/subsidy.interface";
import { SUBSIDY_TYPES } from "../lib/subsidy.constants";

export type SubsidyColumns = ColumnDef<SubsidyResource>;

const typeLabel = (type: string) => {
  const label = SUBSIDY_TYPES.find((t) => t.value === type)?.label;
  return typeof label === "string" ? label : type;
};

export const subsidyColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (row: SubsidyResource) => void;
  onDelete: (id: number) => void;
}): SubsidyColumns[] => [
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
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant="outline">{typeLabel(row.original.type)}</Badge>
    ),
  },
  {
    id: "rango",
    header: "Periodo subsidiado",
    cell: ({ row }) => (
      <span>
        {formatDate(row.original.start_date)} al{" "}
        {formatDate(row.original.end_date)}
      </span>
    ),
  },
  {
    accessorKey: "days",
    header: "Días",
    cell: ({ row }) => <span>{row.original.days}</span>,
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => (
      <span className="font-semibold">
        S/{" "}
        {Number(row.original.amount).toLocaleString("es-PE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    accessorKey: "reference",
    header: "Referencia (CITT)",
    cell: ({ row }) => <span>{row.original.reference ?? "—"}</span>,
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <ButtonAction
          icon={Pencil}
          tooltip="Editar"
          type="button"
          onClick={() => onEdit(row.original)}
        />
        <DeleteButton onClick={() => onDelete(row.original.id)} />
      </div>
    ),
  },
];
