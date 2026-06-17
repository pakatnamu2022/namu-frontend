"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { WorkScheduleResource } from "../lib/work-schedule.interface";
import { Button } from "@/components/ui/button";
import { Pencil, Users } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { useNavigate } from "react-router-dom";
import { WORK_SCHEDULE } from "../lib/work-schedule.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

function timeStr(t: string | null | undefined) {
  return t ? t.slice(0, 5) : "—";
}

export const workScheduleColumns = ({
  onDelete,
  onAssignBulk,
}: {
  onDelete: (id: number) => void;
  onAssignBulk: (id: number) => void;
}): ColumnDef<WorkScheduleResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "checkin",
    header: "Entrada",
    cell: ({ getValue }) => (
      <span className="tabular-nums font-mono text-sm">
        {timeStr(getValue() as string)}
      </span>
    ),
  },
  {
    accessorKey: "lunch_out",
    header: "Salida almuerzo",
    cell: ({ getValue }) => (
      <span className="tabular-nums font-mono text-sm">
        {timeStr(getValue() as string | null)}
      </span>
    ),
  },
  {
    accessorKey: "lunch_in",
    header: "Regreso almuerzo",
    cell: ({ getValue }) => (
      <span className="tabular-nums font-mono text-sm">
        {timeStr(getValue() as string | null)}
      </span>
    ),
  },
  {
    accessorKey: "checkout",
    header: "Salida",
    cell: ({ getValue }) => (
      <span className="tabular-nums font-mono text-sm">
        {timeStr(getValue() as string)}
      </span>
    ),
  },
  {
    id: "details_count",
    header: "Excepciones por día",
    cell: ({ row }) => {
      const count = row.original.details?.length ?? 0;
      return count > 0 ? (
        <Badge variant="outline">{count} día{count !== 1 ? "s" : ""}</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
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
      const { ROUTE_UPDATE } = WORK_SCHEDULE;

      return (
        <div className="flex items-center gap-2">
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

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={() => onAssignBulk(id)}
                >
                  <Users className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Asignar masivamente</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
