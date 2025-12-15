"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PositionResource } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.interface.ts";
import { Button } from "@/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { POSITION } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant.ts";
import { Pencil } from "lucide-react";

export type PositionColumns = ColumnDef<PositionResource>;

const { ROUTE_UPDATE } = POSITION;

export const positionColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): PositionColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ getValue }) => (
      <p className="text-wrap font-semibold">{getValue() as string}</p>
    ),
  },
  {
    accessorKey: "area",
    header: "Área",
  },
  {
    accessorKey: "position_head_name",
    header: "Jefatura",
  },
  {
    accessorKey: "hierarchical_category_name",
    header: "Categoría Jerárquica",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
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
