"use client";

import { ColumnDef } from "@tanstack/react-table";
import { WorkTypeResource } from "../lib/work-type.interface";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { WORK_TYPE } from "../lib/work-type.constant";

export type WorkTypeColumns = ColumnDef<WorkTypeResource>;

export const workTypeColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): WorkTypeColumns[] => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="text-wrap line-clamp-1">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "multiplier",
    header: "Multiplicador",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue() as number}</span>
    ),
  },
  {
    accessorKey: "base_hours",
    header: "Horas Base",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue() as number}h</span>
    ),
  },
  {
    accessorKey: "is_extra_hours",
    header: "Horas Extra",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return value ? (
        <Check className="size-4 text-green-600" />
      ) : (
        <X className="size-4 text-muted-foreground" />
      );
    },
  },
  {
    accessorKey: "is_night_shift",
    header: "Nocturno",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return value ? (
        <Check className="size-4 text-green-600" />
      ) : (
        <X className="size-4 text-muted-foreground" />
      );
    },
  },
  {
    accessorKey: "is_holiday",
    header: "Feriado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return value ? (
        <Check className="size-4 text-green-600" />
      ) : (
        <X className="size-4 text-muted-foreground" />
      );
    },
  },
  {
    accessorKey: "is_sunday",
    header: "Domingo",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return value ? (
        <Check className="size-4 text-green-600" />
      ) : (
        <X className="size-4 text-muted-foreground" />
      );
    },
  },
  {
    accessorKey: "active",
    header: "Estado",
    cell: ({ getValue }) => {
      const active = getValue() as boolean;
      return (
        <Badge color={active ? "default" : "secondary"}>
          {active ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "order",
    header: "Orden",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const { id } = row.original;
      const { ROUTE_UPDATE } = WORK_TYPE;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
          >
            <Pencil className="size-4" />
          </Button>
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
