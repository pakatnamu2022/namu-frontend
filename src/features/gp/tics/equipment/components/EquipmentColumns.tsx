"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EquipmentResource } from "../lib/equipment.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  History,
  Pencil,
  Sparkles,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { EQUIPMENT } from "../lib/equipment.constants";

export type EquipmentColumns = ColumnDef<EquipmentResource>;

export const equipmentColumns = ({
  onDelete,
  onAssign,
  onHistory,
}: {
  onDelete: (id: number) => void;
  onAssign: (id: number) => void;
  onHistory: (id: number) => void;
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
      return value && <Badge variant="outline">{value}</Badge>;
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
      const { ROUTE_UPDATE } = EQUIPMENT;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
          >
            <Pencil className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onAssign(id)}
          >
            <UserPlus className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onHistory(id)}
          >
            <History className="size-5" />
          </Button>
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
