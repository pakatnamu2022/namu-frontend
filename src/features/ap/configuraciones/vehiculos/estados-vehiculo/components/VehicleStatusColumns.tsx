import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { VehicleStatusResource } from "../lib/vehicleStatus.interface";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { VEHICLE_STATUS } from "../lib/vehicleStatus.constants";

export type VehicleStatusColumns = ColumnDef<VehicleStatusResource>;

interface Props {
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const vehicleStatusColumns = ({
  onDelete,
  onToggleStatus,
  permissions,
}: Props): VehicleStatusColumns[] => [
  {
    accessorKey: "code",
    header: "Cod.",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "use",
    header: "Uso",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const usoMap: Record<string, string> = {
        taller: "Taller",
        ventas_vehiculos: "Ventas",
      };
      return <p>{usoMap[value] ?? value}</p>;
    },
  },

  {
    accessorKey: "color",
    header: "Color",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full border"
            style={{ backgroundColor: value }}
          />
          <span>{value}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge
          color={value ? "default" : "secondary"}                      
          className="capitalize w-20 flex items-center justify-center"
        >
          {value ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const { id, status } = row.original;
      const { ROUTE_UPDATE } = VEHICLE_STATUS;

      return (
        <div className="flex items-center gap-2">
          {/* Toggle Status */}
          {permissions.canUpdate && (
            <Switch
              checked={status}
              onCheckedChange={(checked) => onToggleStatus(id, checked)}
              className={cn(status ? "bg-primary" : "bg-secondary")}
            />
          )}

          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
            >
              <Pencil className="size-5" />
            </Button>
          )}

          {/* Delete */}
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
