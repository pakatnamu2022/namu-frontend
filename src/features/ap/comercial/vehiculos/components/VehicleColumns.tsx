"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { VehicleResource } from "../lib/vehicles.interface";
import { Button } from "@/components/ui/button";
import { Pencil, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ButtonAction } from "@/shared/components/ButtonAction";
import VehicleMovements from "./VehicleMovements";
import VehicleWorkOrderHistory from "./VehicleWorkOrderHistory";
import ChangeLocationModal from "./ChangeLocationModal";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { VEHICLE_STATUS_ID } from "@/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.constants";
import {
  MODELS_VN,
  MODELS_VN_POSTVENTA,
} from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.constanst";

export type VehicleColumns = ColumnDef<VehicleResource>;

interface Props {
  onDelete?: (id: number) => void;
  onUpdate?: (id: number) => void;
  permissions: {
    canViewHistory: boolean;
    canMaintenance: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canChangeLocation?: boolean;
  };
}

export const vehicleColumns = ({
  onUpdate,
  onDelete,
  permissions,
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
    accessorKey: "sede_name_warehouse",
    header: "Sede",
  },
  {
    accessorKey: "engine_number",
    header: "# Motor",
  },
  {
    accessorKey: "model.code",
    header: "# Modelo",
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
    accessorKey: "vehicle_color",
    header: "Color",
  },
  {
    accessorKey: "engine_type",
    header: "Tipo Motor",
  },
  {
    accessorKey: "vehicle_status",
    header: "Estado Vehículo",
    cell: ({ row }) => {
      const value = row.original.vehicle_status;
      const statusColor = row.original.status_color;
      return (
        value && (
          <p
            style={{
              color: statusColor,
            }}
            className="font-semibold py-0.5 px-2 bg-muted rounded-md w-fit text-xs"
          >
            {value}
          </p>
        )
      );
    },
  },
  {
    accessorKey: "model.brand",
    header: "Marca",
  },
  {
    accessorKey: "year",
    header: "Año Fabricación",
  },
  {
    accessorKey: "year_delivery",
    header: "Año de Entrega",
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
    accessorKey: "plate",
    header: "Placa",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const {
        id,
        plate,
        movements,
        type_operation_id,
        vin,
        ap_vehicle_status_id,
        warehouse_id,
        warehouse_name,
        model,
      } = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { ROUTE_UPDATE } =
        type_operation_id === CM_COMERCIAL_ID ? MODELS_VN : MODELS_VN_POSTVENTA;

      return (
        <div className="flex items-center gap-2">
          {/* View Model */}
          <ButtonAction
            icon={Box}
            tooltip="Ver Modelo"
            onClick={() => router(`${ROUTE_UPDATE}/${model.id}`)}
            canRender={!!model?.id}
          />

          {/* Movements */}
          {permissions.canViewHistory && (
            <VehicleMovements movements={movements || []} />
          )}

          {/* Change Location */}
          {permissions.canChangeLocation &&
            ap_vehicle_status_id === VEHICLE_STATUS_ID.VEHICULO_EN_TRANSITO && (
              <ChangeLocationModal
                vehicleId={id}
                vehicleVin={vin}
                apClassArticleId={row.original.model.class_id}
                currentWarehouseId={warehouse_id}
                currentWarehouseName={warehouse_name}
              />
            )}

          {/* Work Order History */}
          {permissions.canMaintenance && (
            <VehicleWorkOrderHistory vehicleId={id} vehiclePlate={plate} />
          )}

          {/* Edit */}
          {permissions.canUpdate && onUpdate && (
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
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete!(id)} />
          )}
        </div>
      );
    },
  },
];
