"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CompetenceResource } from "../lib/competence.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";

export type CompetenceColumns = ColumnDef<CompetenceResource>;

export const competenceColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): CompetenceColumns[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold !text-wrap line-clamp-1">{getValue() as string}</span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`./competencias/actualizar/${id}`)}
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
