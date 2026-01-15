"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EquipmentTypeResource } from "../lib/equipmentType.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";

export type EquipmentTypeColumns = ColumnDef<EquipmentTypeResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
}

export const equipmentTypeColumns = ({
  onUpdate,
  onDelete,
}: Props): EquipmentTypeColumns[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="uppercase">{value}</p>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onUpdate(id)}
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
