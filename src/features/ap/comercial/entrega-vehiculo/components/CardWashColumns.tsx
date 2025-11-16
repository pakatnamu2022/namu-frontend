"use client";

import { ColumnDef } from "@tanstack/react-table";
import { VehiclesDeliveryResource } from "../lib/vehicleDelivery.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { ConfirmationDialog } from "@/src/shared/components/ConfirmationDialog";

export type VehicleDeliveryColumns = ColumnDef<VehiclesDeliveryResource>;

interface Props {
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
    canView: boolean;
  };
  onConfirmWash: (id: number) => void;
}

export const cardWashColumns = ({
  permissions,
  onConfirmWash,
}: Props): VehicleDeliveryColumns[] => [
  {
    accessorKey: "advisor_name",
    header: "Asesor",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "vin",
    header: "VIN",
  },
  {
    accessorKey: "wash_date",
    header: "Fecha Lavado",
    cell: ({ getValue }) => {
      const value = getValue() as string | Date;
      if (!value) return "-";
      try {
        const date = typeof value === "string" ? new Date(value) : value;
        return format(date, "dd/MM/yyyy", { locale: es });
      } catch {
        return "-";
      }
    },
  },
  {
    accessorKey: "status_wash",
    header: "Estado Lavado",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Badge
          variant={value == "Completado" ? "default" : "secondary"}
          className="capitalize w-24 flex items-center justify-center"
        >
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "observations",
    header: "Observaciones",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <p className="max-w-xs truncate" title={value}>
          {value}
        </p>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, status_wash } = row.original;
      const isCompleted = status_wash === "Completado";

      return (
        <div className="flex items-center gap-2">
          {permissions.canUpdate && !isCompleted && (
            <ConfirmationDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar Lavado
                </Button>
              }
              title="¿Confirmar lavado del vehículo?"
              description="¿Estás seguro de que el vehículo ya ha sido lavado? Esta acción actualizará el estado del lavado a completado."
              confirmText="Sí, confirmar"
              cancelText="Cancelar"
              onConfirm={() => onConfirmWash(id)}
              variant="default"
              icon="warning"
            />
          )}
          {isCompleted && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Completado
            </Badge>
          )}
        </div>
      );
    },
  },
];
