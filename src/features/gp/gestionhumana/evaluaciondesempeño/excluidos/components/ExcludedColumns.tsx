"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EvaluationPersonDetailResource } from "../lib/excluded.interface";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";

export type ExcludedColumns = ColumnDef<EvaluationPersonDetailResource>;

export const excludedColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): ExcludedColumns[] => [
  {
    accessorKey: "person.name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "person.document",
    header: "Documento",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "person.sede",
    header: "Sede",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
