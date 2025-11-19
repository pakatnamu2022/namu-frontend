"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PeriodResource } from "../lib/period.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { PERIOD } from "../lib/period.constans";

export type PeriodColumns = ColumnDef<PeriodResource>;

export const periodColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): PeriodColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "start_date",
    header: "Fecha de Inicio",
  },
  {
    accessorKey: "end_date",
    header: "Fecha de Fin",
  },
  {
    accessorKey: "active",
    header: "Estado",
    cell: ({ getValue }) => (
      <Badge variant={getValue() ? "default" : "tertiary"}>
        {getValue() ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const id = row.original.id;
      const { ROUTE_UPDATE } = PERIOD;

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
