"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { formatDateTime } from "@/core/core.function";
import { AttendanceCodeMappingResource } from "../lib/attendance-code-mapping.interface";

export type AttendanceCodeMappingColumns =
  ColumnDef<AttendanceCodeMappingResource>;

export const attendanceCodeMappingColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): AttendanceCodeMappingColumns[] => [
  {
    accessorKey: "emp_code",
    header: "Código del Dispositivo",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "vat",
    header: "DNI",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    accessorKey: "note",
    header: "Nota",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value ? (
        <span className="text-wrap line-clamp-2">{value}</span>
      ) : (
        <Badge variant="outline">Sin nota</Badge>
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
