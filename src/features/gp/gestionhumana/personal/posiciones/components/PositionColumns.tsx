"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PositionResource } from "../lib/position.interface";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { POSITION } from "../lib/position.constant";
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
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useRouter();
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router.push(`./${ROUTE_UPDATE}/${id}`)}
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
