import { useState, useEffect } from "react";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Calendar, Car } from "lucide-react";
import { useVehicleInspection } from "../lib/vehicleInspection.hook";
import { VehicleInspectionResource } from "../lib/vehicleInspection.interface";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import DatePicker from "@/shared/components/DatePicker";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { VehicleInspectionSelectionTable } from "./VehicleInspectionSelectionTable";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { errorToast, getMonday, getSunday } from "@/core/core.function";
import SearchInput from "@/shared/components/SearchInput";
import { Badge } from "@/components/ui/badge";

interface VehicleInspectionSelectionModalProps {
  open: boolean;
  sedeId: number;
  onOpenChange: (open: boolean) => void;
  onSelectInspection: (inspection: VehicleInspectionResource) => void;
}

export const VehicleInspectionSelectionModal = ({
  open,
  sedeId,
  onOpenChange,
  onSelectInspection,
}: VehicleInspectionSelectionModalProps) => {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const currentDate = new Date();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    getMonday(currentDate),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    getSunday(currentDate),
  );

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [per_page, search, dateFrom, dateTo]);

  useEffect(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      errorToast("La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.");
    }
  }, [dateFrom, dateTo]);

  const { data, isLoading } = useVehicleInspection({
    page,
    per_page,
    search,
    is_cancelled: 0,
    inspection_date:
      dateFrom || dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
    workOrder$sede_id: sedeId,
  });

  const handleRowClick = (inspection: VehicleInspectionResource) => {
    onSelectInspection(inspection);
    onOpenChange(false);
  };

  const columns: ColumnDef<VehicleInspectionResource>[] = [
    {
      accessorKey: "vehicle_plate",
      header: "Placa",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{value || "S/N"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "vehicle_vin",
      header: "VIN",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span className="font-medium text-xs">{value || "-"}</span>;
      },
    },
    {
      accessorKey: "work_order_correlative",
      header: "OT Origen",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return value ? (
          <Badge variant="outline" className="font-medium">
            {value}
          </Badge>
        ) : (
          "-"
        );
      },
    },
    {
      id: "inspection_datetime",
      header: "Fecha Inspección",
      cell: ({ row }) => {
        const date = row.original.inspection_date;

        if (!date) return "-";

        try {
          const dateStr =
            typeof date === "string" ? date : date.toISOString().split("T")[0];
          const formattedDate = format(
            new Date(dateStr + "T00:00:00"),
            "dd/MM/yyyy",
            { locale: es },
          );
          return (
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{formattedDate}</span>
            </div>
          );
        } catch {
          return String(date);
        }
      },
    },
    {
      accessorKey: "mileage",
      header: "Kilometraje",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span>{value ? `${value} km` : "-"}</span>;
      },
    },
    {
      accessorKey: "inspected_by_name",
      header: "Inspeccionado por",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span className="text-sm">{value || "-"}</span>;
      },
    },
  ];

  return (
    <GeneralModal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Seleccionar Inspección de Vehículo"
      size="7xl"
    >
      <div className="space-y-4">
        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="w-full">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar placa o cliente..."
              label="Buscar"
            />
          </div>
          <div className="w-full">
            <DatePicker
              value={dateFrom}
              onChange={setDateFrom}
              label="Fecha Desde"
              placeholder="Fecha Desde"
              showClearButton={false}
              captionLayout="dropdown"
            />
          </div>
          <div className="w-full">
            <DatePicker
              value={dateTo}
              onChange={setDateTo}
              label="Fecha Hasta"
              placeholder="Fecha Hasta"
              showClearButton={false}
              captionLayout="dropdown"
            />
          </div>
        </div>

        {/* Tabla */}
        <VehicleInspectionSelectionTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          initialColumnVisibility={{
            vehicle_plate: true,
            vehicle_vin: true,
            work_order_correlative: true,
            inspection_datetime: true,
            mileage: true,
            inspected_by_name: true,
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
    </GeneralModal>
  );
};
