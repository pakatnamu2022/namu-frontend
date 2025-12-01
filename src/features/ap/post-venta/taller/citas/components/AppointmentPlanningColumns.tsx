import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { AppointmentPlanningResource } from "../lib/appointmentPlanning.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type AppointmentPlanningColumns = ColumnDef<AppointmentPlanningResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const appointmentPlanningColumns = ({
  onUpdate,
  onDelete,
  permissions,
}: Props): AppointmentPlanningColumns[] => [
  {
    accessorKey: "full_name_client",
    header: "Cliente",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "email_client",
    header: "Email",
  },
  {
    accessorKey: "phone_client",
    header: "Teléfono",
  },
  {
    accessorKey: "date_appointment",
    header: "Fecha de Cita",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        const date = new Date(value + "T00:00:00");
        return format(date, "dd/MM/yyyy", { locale: es });
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "time_appointment",
    header: "Hora de Cita",
  },
  {
    accessorKey: "delivery_date",
    header: "Fecha de Entrega",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        const date = new Date(value + "T00:00:00");
        return format(date, "dd/MM/yyyy", { locale: es });
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "delivery_time",
    header: "Hora de Entrega",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <div className="flex items-center gap-2">
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onUpdate(id)}
            >
              <Pencil className="size-5" />
            </Button>
          )}

          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
