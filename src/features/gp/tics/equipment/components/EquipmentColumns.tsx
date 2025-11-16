"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EquipmentResource } from "../lib/equipment.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, History, Pencil, Sparkles, XCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";

export type EquipmentColumns = ColumnDef<EquipmentResource>;

export const equipmentColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): EquipmentColumns[] => [
  {
    accessorKey: "equipo",
    header: "Equipo",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "tipo_equipo",
    header: "Tipo de Equipo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <Badge variant="outline">{value}</Badge>;
    },
  },
  {
    accessorKey: "serie",
    header: "Serie",
  },
  {
    accessorKey: "empresa",
    header: "Empresa",
  },
  {
    accessorKey: "estado_uso",
    header: "Estado de Uso",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Badge variant="outline" className="capitalize gap-2">
          {value === "NUEVO" ? (
            <Sparkles className="size-4 text-amber-500" />
          ) : (
            <History className="size-4 text-gray-500" />
          )}
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Badge variant="outline" className="capitalize gap-2">
          {value === "ASIGNADO" ? (
            <CheckCircle className="size-4 text-primary" />
          ) : (
            <XCircle className="size-4 text-secondary" />
          )}
          {value}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`./equipos/actualizar/${id}`)}
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
