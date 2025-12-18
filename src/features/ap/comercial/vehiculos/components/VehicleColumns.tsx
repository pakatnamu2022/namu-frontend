"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { VehicleResource } from "../lib/vehicles.interface";
import { Button } from "@/components/ui/button";
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
    accessorKey: "owner_name",
    header: "Propietario",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "vin",
    header: "VIN",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "plate",
    header: "Placa",
  },
  {
    accessorKey: "model.brand",
    header: "Marca",
  },
  {
    accessorKey: "model.family",
    header: "Familia",
  },
  {
    accessorKey: "model.version",
    header: "Modelo",
  },
  {
    accessorKey: "model.code",
    header: "# Modelo",
  },
  {
    accessorKey: "year",
    header: "Año",
  },
  {
    accessorKey: "engine_number",
    header: "# Motor",
  },
  {
    accessorKey: "vehicle_color",
    header: "Color",
  },
  {
    accessorKey: "sede_name_warehouse",
    header: "Sede",
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
