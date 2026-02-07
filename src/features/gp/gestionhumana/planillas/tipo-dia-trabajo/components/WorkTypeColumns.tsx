"use client";

import { ColumnDef } from "@tanstack/react-table";
import { WorkTypeResource } from "../lib/work-type.interface";
import { Button } from "@/components/ui/button";
import { Pencil, ListTree } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { WORK_TYPE } from "../lib/work-type.constant";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    accessorKey: "description",
    header: "Descripción",
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
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id } = row.original;
      const { ROUTE_UPDATE, ABSOLUTE_ROUTE } = WORK_TYPE;

      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={() => router(`${ABSOLUTE_ROUTE}/segmentos/${id}`)}
                >
                  <ListTree className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gestionar Segmentos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
                >
                  <Pencil className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
