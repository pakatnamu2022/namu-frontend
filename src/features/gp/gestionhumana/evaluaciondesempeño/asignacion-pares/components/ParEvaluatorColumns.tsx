"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { WorkerResource } from "../../../personal/trabajadores/lib/worker.interface";
import { Link } from "react-router-dom";
import { PAR_EVALUATOR } from "../lib/par-evaluator.constant";

export type ParEvaluatorColumns = ColumnDef<WorkerResource>;

export const parEvaluatorColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
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

      return (
        <div className="flex items-center gap-2">
          {/* Assign */}
          <Link to={`${PAR_EVALUATOR.ROUTE_ADD}?worker_id=${id}`}>
            <Button variant="outline" size="sm" className="h-7">
              <UserPlus className="size-4 mr-1" />
              Asignar
            </Button>
          </Link>
          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
