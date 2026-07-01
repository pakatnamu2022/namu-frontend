"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { formatDateTime } from "@/core/core.function";
import { AttendanceExclusionResource } from "../lib/attendance-exclusion.interface";

export type AttendanceExclusionColumns = ColumnDef<AttendanceExclusionResource>;

export const attendanceExclusionColumns = ({
  onEdit,
  onDelete,
  onToggleActive,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, active: boolean) => void;
}): AttendanceExclusionColumns[] => [
  {
    accessorKey: "person.name",
    header: "Colaborador",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "person.document",
    header: "Documento",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    accessorKey: "reason",
    header: "Motivo",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value ? (
        <span className="text-wrap line-clamp-2">{value}</span>
      ) : (
        <Badge variant="outline">Sin motivo</Badge>
      );
    },
  },
  {
    accessorKey: "active",
    header: "Estado",
    cell: ({ getValue, row }) => {
      const val = getValue() as boolean;
      return (
        <Switch
          checked={val}
          onCheckedChange={(checked) => onToggleActive(row.original.id, checked)}
        />
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Creado",
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">
        {formatDateTime(getValue() as string)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={() => onEdit(id)}
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
