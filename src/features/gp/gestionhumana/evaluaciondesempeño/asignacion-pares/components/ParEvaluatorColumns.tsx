"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { WorkerResource } from "../../../personal/trabajadores/lib/worker.interface";

export type ParEvaluatorColumns = ColumnDef<WorkerResource>;

export const parEvaluatorColumns = ({
  onDelete,
  onAssign,
}: {
  onDelete: (id: number) => void;
  onAssign: (id: number, workerId: number) => void;
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
      const workerId = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* Assign */}
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            onClick={() => onAssign(id, workerId)}
          >
            <UserPlus className="size-4 mr-1" />
            Asignar
          </Button>
          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
