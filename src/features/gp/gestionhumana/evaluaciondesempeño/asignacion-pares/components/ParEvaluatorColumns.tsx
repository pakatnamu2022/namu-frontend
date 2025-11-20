"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ParEvaluatorResource } from "../lib/par-evaluator.interface";

export type ParEvaluatorColumns = ColumnDef<ParEvaluatorResource>;

export const parEvaluatorColumns = ({
  onDelete,
  onEdit,
}: {
  onDelete: (id: number) => void;
  onEdit: (id: number, workerId: number) => void;
}): ParEvaluatorColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "document",
    header: "Documento",
  },
  {
    accessorKey: "sede",
    header: "Sede",
  },
  {
    accessorKey: "position",
    header: "Cargo",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;
      const workerId = row.original.worker_id;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onEdit(id, workerId)}
          >
            <Pencil className="size-5" />
          </Button>
          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
