"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { VehicleResource } from "../lib/vehicles.interface";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import VehicleMovements from "./VehicleMovements";
import { CM_POSTVENTA_ID } from "@/core/core.constants";

export type VehicleColumns = ColumnDef<VehicleResource>;

interface Props {
  onDelete?: (id: number) => void;
  onUpdate?: (id: number) => void;
}

export const vehicleColumns = ({
  onUpdate,
  onDelete,
}: Props): VehicleColumns[] => [
  {
    accessorKey: "vin",
    header: "VIN",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        value && (
          <Badge variant="outline" className="font-mono text-sm font-normal">
            {value}
          </Badge>
        )
      );
    },
  },
  {
    accessorKey: "brand",
    header: "Marca",
    cell: ({ row }) => {
      const brand = row.original.model.brand;
      if (brand)
        return (
          <Badge variant="outline" className="w-fit text-xs text-primary">
            {brand}
          </Badge>
        );
    },
  },
  {
    accessorKey: "family",
    header: "Familia",
    cell: ({ row }) => {
      const family = row.original.model.family;
      if (family)
        return (
          <Badge variant="outline" className="w-fit text-xs text-primary">
            {family}
          </Badge>
        );
    },
  },
  {
    accessorKey: "model",
    header: "Modelo",
    cell: ({ row }) => {
      const model = row.original.model.version;
      if (model)
        return (
          <Badge variant="outline" className="w-fit text-xs">
            {model}
          </Badge>
        );
    },
  },
  {
    accessorKey: "model_code",
    header: "# Modelo",
    cell: ({ row }) => {
      const code = row.original.model.code;
      if (code)
        return (
          <Badge variant="outline" className="w-fit text-xs">
            {code}
          </Badge>
        );
    },
  },
  {
    accessorKey: "year",
    header: "Año",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <p className="font-medium">{value}</p>;
    },
  },
  {
    accessorKey: "engine_number",
    header: "Nro. Motor",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-mono text-sm">{value}</p>;
    },
  },
  {
    accessorKey: "vehicle_color",
    header: "Color",
  },
  {
    accessorKey: "engine_type",
    header: "Tipo Motor",
  },
  {
    accessorKey: "warehouse_physical",
    header: "Almacén Físico",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value ? value : <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.original.vehicle_status || "";
      const color = row.original.status_color || "#6b7280";

      // Calcular luminosidad para determinar color de texto
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      return (
        <Badge
          className="border-0"
          style={{
            backgroundColor: color,
            color: luminance > 0.5 ? "#000000" : "#FFFFFF",
          }}
        >
          {estado}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, movements, type_operation_id } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Movements */}
          <VehicleMovements movements={movements || []} />

          {/* Edit */}
          {type_operation_id === CM_POSTVENTA_ID && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar Vehículo"
              onClick={() => onUpdate!(id)}
            >
              <Pencil className="size-4" />
            </Button>
          )}

          {/* Delete */}
          {type_operation_id === CM_POSTVENTA_ID && (
            <DeleteButton onClick={() => onDelete!(id)} />
          )}
        </div>
      );
    },
  },
];
