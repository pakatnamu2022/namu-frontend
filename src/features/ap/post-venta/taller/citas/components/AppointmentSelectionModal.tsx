import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock } from "lucide-react";
import { useAppointmentPlanning } from "../lib/appointmentPlanning.hook";
import { AppointmentPlanningResource } from "../lib/appointmentPlanning.interface";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import DatePicker from "@/shared/components/DatePicker";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { AppointmentSelectionTable } from "./AppointmentSelectionTable";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { errorToast } from "@/core/core.function";
import SearchInput from "@/shared/components/SearchInput";

interface AppointmentSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAppointment: (appointmentId: string) => void;
}

export const AppointmentSelectionModal = ({
  open,
  onOpenChange,
  onSelectAppointment,
}: AppointmentSelectionModalProps) => {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const currentDate = new Date();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(currentDate);
  const [dateTo, setDateTo] = useState<Date | undefined>(currentDate);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toISOString().split("T")[0] : undefined;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [per_page]);

  useEffect(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      errorToast("La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.");
    }
  }, [dateFrom, dateTo]);

  const { data, isLoading } = useAppointmentPlanning({
    page,
    per_page,
    is_taken: 0,
    search,
    date_appointment:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
  });

  const handleRowClick = (appointment: AppointmentPlanningResource) => {
    onSelectAppointment(appointment.id.toString());
    onOpenChange(false);
  };

  const columns: ColumnDef<AppointmentPlanningResource>[] = [
    {
      accessorKey: "full_name_client",
      header: "Cliente",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return value && <p className="font-semibold">{value}</p>;
      },
    },
    {
      accessorKey: "plate",
      header: "Placa",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span className="font-medium">{value || "-"}</span>;
      },
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
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-[85vw] md:w-[80vw] lg:w-[75vw] xl:w-[70vw] 2xl:max-w-[1400px] h-[85vh] sm:h-[80vh] md:h-[75vh] lg:h-[80vh] overflow-hidden flex flex-col p-3 sm:p-4 md:p-5 lg:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Seleccionar Cita de Planificación
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-3 sm:space-y-4">
          {/* Filtros */}
          <div className="flex items-end gap-2 flex-wrap">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar placa o cliente..."
              label="Buscar"
            />
            <DatePicker
              value={dateFrom}
              onChange={setDateFrom}
              label="Fecha Desde"
              placeholder="Fecha Desde"
              showClearButton={false}
              captionLayout="dropdown"
            />
            <DatePicker
              value={dateTo}
              onChange={setDateTo}
              label="Fecha Hasta"
              placeholder="Fecha Hasta"
              showClearButton={false}
              captionLayout="dropdown"
            />
          </div>

          {/* Tabla */}
          <AppointmentSelectionTable
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            initialColumnVisibility={{
              full_name_client: true,
              plate: true,
              appointment_datetime: true,
            }}
            onRowClick={handleRowClick}
          />

          {/* Paginación */}
          <DataTablePagination
            page={page}
            totalPages={data?.meta?.last_page || 1}
            totalData={data?.meta?.total || 0}
            onPageChange={setPage}
            per_page={per_page}
            setPerPage={setPerPage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
