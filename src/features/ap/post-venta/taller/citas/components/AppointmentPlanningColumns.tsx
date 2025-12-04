import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Download } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { AppointmentPlanningResource } from "../lib/appointmentPlanning.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { downloadAppointmentPlanningPdf } from "../lib/appointmentPlanning.actions";
import { errorToast } from "@/core/core.function";

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
