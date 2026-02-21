"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AttendanceRuleResource } from "../lib/attendance-rule.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ATTENDANCE_RULE } from "../lib/attendance-rule.constant";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type AttendanceRuleColumns = ColumnDef<AttendanceRuleResource>;

export const attendanceRuleColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): AttendanceRuleColumns[] => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "hour_type",
    header: "Tipo de Hora",
    cell: ({ getValue }) => (
      <span className="text-wrap line-clamp-1">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "hours",
    header: "Horas",
    cell: ({ getValue }) => {
      const val = getValue() as number | null;
      return (
        <span className="font-mono">{val !== null ? `${val}h` : "—"}</span>
      );
    },
  },
  {
    accessorKey: "multiplier",
    header: "Multiplicador",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue() as number}</span>
    ),
  },
  {
    accessorKey: "pay",
    header: "¿Se paga?",
    cell: ({ getValue }) => {
      const val = getValue() as boolean;
      return <Badge variant="default">{val ? "Sí" : "No"}</Badge>;
    },
  },
  {
    accessorKey: "use_shift",
    header: "¿Usa turno?",
    cell: ({ getValue }) => {
      const val = getValue() as boolean;
      return <Badge variant="default">{val ? "Sí" : "No"}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id } = row.original;
      const { ROUTE_UPDATE } = ATTENDANCE_RULE;

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

          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
