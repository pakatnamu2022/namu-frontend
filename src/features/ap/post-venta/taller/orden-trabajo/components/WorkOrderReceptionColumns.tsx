import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Calendar, Settings } from "lucide-react";
import { WorkOrderResource } from "../lib/workOrder.interface";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export type WorkOrderColumns = ColumnDef<WorkOrderResource>;

interface Props {
  onManage: (id: number) => void;
  permissions: {
    canReceive: boolean;
    canManage: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const workOrderReceptionColumns = ({
  onManage,
  permissions,
}: Props): WorkOrderColumns[] => [
  {
    accessorKey: "correlative",
    header: "Correlativo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "vehicle_plate",
    header: "Placa",
  },
  {
    accessorKey: "vehicle_vin",
    header: "VIN",
  },
  {
    accessorKey: "mileage",
    header: "Kilometraje",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? `${value} km` : "-";
    },
  },
  {
    accessorKey: "fuel_level",
    header: "Nivel de Combustible",
  },
  {
    accessorKey: "opening_date",
    header: "Fecha de Apertura",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        const date = new Date(value.replace(" ", "T"));
        return format(date, "dd/MM/yyyy", { locale: es });
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "estimated_delivery_date",
    header: "Fecha y Hora Entrega",
    cell: ({ row }) => {
      const dateValue = row.original.estimated_delivery_date;
      const timeValue = row.original.estimated_delivery_time;
      if (!dateValue && !timeValue)
        return <span className="text-muted-foreground">-</span>;
      if (!dateValue)
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{timeValue || "-"}</span>
          </div>
        );

      try {
        const dateOnly = dateValue.replace(" ", "T").split("T")[0];
        const fullTime = (timeValue || "00:00:00").split(" ")[0];
        const datetime = `${dateOnly}T${fullTime}`;

        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(parseISO(datetime), "dd/MM/yyyy HH:mm", {
                locale: es,
              })}
            </span>
          </div>
        );
      } catch {
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {[dateValue, timeValue].filter(Boolean).join(" ")}
            </span>
          </div>
        );
      }
    },
  },
  {
    accessorKey: "actual_delivery_date",
    header: "Fecha Real Entrega",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        const date = new Date(value.replace(" ", "T"));
        return format(date, "dd/MM/yyyy", { locale: es });
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "is_guarantee",
    header: "Garantía",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge variant="outline" color={value ? "green" : "blue"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_recall",
    header: "Recall",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge variant="outline" color={value ? "green" : "blue"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_invoiced",
    header: "Facturado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge color={value ? "default" : "secondary"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status.description",
    header: "Estado",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <div className="flex items-center gap-2">
          {permissions.canManage && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Gestionar"
              onClick={() => onManage(id)}
            >
              <Settings className="size-5" />
            </Button>
          )}
        </div>
      );
    },
  },
];
