import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Download, Calendar, Clock } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { AppointmentPlanningResource } from "../lib/appointmentPlanning.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { downloadAppointmentPlanningPdf } from "../lib/appointmentPlanning.actions";
import { errorToast } from "@/core/core.function";
import { Badge } from "@/components/ui/badge";

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
    accessorKey: "sede_name",
    header: "Sede",
  },
  {
    accessorKey: "plate",
    header: "Placa",
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
    id: "appointment_datetime",
    header: "Fecha y Hora de Cita",
    cell: ({ row }) => {
      const date = row.original.date_appointment;
      const time = row.original.time_appointment;

      if (!date) return "-";

      try {
        const formattedDate = format(
          new Date(date + "T00:00:00"),
          "dd/MM/yyyy",
          { locale: es }
        );
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            {time && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{time}</span>
              </div>
            )}
          </div>
        );
      } catch {
        return date;
      }
    },
  },
  {
    id: "delivery_datetime",
    header: "Fecha y Hora de Entrega",
    cell: ({ row }) => {
      const date = row.original.delivery_date;
      const time = row.original.delivery_time;

      if (!date) return "-";

      try {
        const formattedDate = format(
          new Date(date + "T00:00:00"),
          "dd/MM/yyyy",
          { locale: es }
        );
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            {time && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{time}</span>
              </div>
            )}
          </div>
        );
      } catch {
        return date;
      }
    },
  },
  {
    accessorKey: "is_taken",
    header: "Tomada",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge
          variant={value ? "default" : "secondary"}
          className="capitalize w-8 flex items-center justify-center"
        >
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, is_taken } = row.original;

      const handleDownloadPdf = async () => {
        try {
          await downloadAppointmentPlanningPdf(id);
        } catch {
          errorToast("Error al descargar el PDF");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={handleDownloadPdf}
            tooltip="PDF"
          >
            <Download className="size-5" />
          </Button>

          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
              onClick={() => onUpdate(id)}
              disabled={is_taken}
            >
              <Pencil className="size-5" />
            </Button>
          )}

          {permissions.canDelete && !is_taken && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
