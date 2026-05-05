"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TelephonePlanResource } from "../lib/telephonePlan.interface";
import { Pencil } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";

interface TelephonePlanColumnsProps {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export const telephonePlanColumns = ({
  onDelete,
  onEdit,
}: TelephonePlanColumnsProps): ColumnDef<TelephonePlanResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.id}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      return <div className="text-sm font-medium">{row.original.name}</div>;
    },
  },
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          S/ {parseFloat(row.original.price).toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {row.original.description}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const plan = row.original;

      return (
        <div className="flex items-center gap-2">
          <ButtonAction icon={Pencil} onClick={() => onEdit(plan.id)} />
          <DeleteButton onClick={() => onDelete(plan.id)} />
        </div>
      );
    },
  },
];
