import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, DollarSign } from "lucide-react";
import { useOrderQuotations } from "../lib/proforma.hook";
import { OrderQuotationResource } from "../lib/proforma.interface";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import DatePicker from "@/shared/components/DatePicker";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { QuotationSelectionTable } from "./QuotationSelectionTable";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { errorToast } from "@/core/core.function";
import { STATUS_ORDER_QUOTATION, SUPPLY_TYPE } from "../lib/proforma.constants";
import { AREA_PM_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

interface QuotationSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectQuotation: (quotationId: string) => void;
}

export const QuotationSelectionModal = ({
  open,
  onOpenChange,
  onSelectQuotation,
}: QuotationSelectionModalProps) => {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const currentDate = new Date();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(currentDate);
  const [dateTo, setDateTo] = useState<Date | undefined>(currentDate);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined; // formato: YYYY-MM-DD
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

  const { data, isLoading } = useOrderQuotations({
    page,
    per_page,
    is_take: 0,
    supply_type: [SUPPLY_TYPE.LIMA, SUPPLY_TYPE.IMPORTACION],
    status: STATUS_ORDER_QUOTATION.TO_BILL,
    area_id: AREA_PM_ID.MESON,
    quotation_date:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
  });

  const handleRowClick = (quotation: OrderQuotationResource) => {
    onSelectQuotation(quotation.id.toString());
    onOpenChange(false);
  };

  const columns: ColumnDef<OrderQuotationResource>[] = [
    {
      accessorKey: "quotation_number",
      header: "Número de Cotización",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return value && <p className="font-semibold">{value}</p>;
      },
    },
    {
      accessorKey: "customer",
      header: "Cliente",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return value && <p className="font-semibold">{value}</p>;
      },
    },
    {
      accessorKey: "vehicle",
      header: "Vehículo",
      cell: ({ row }) => {
        const vehicle = row.original?.vehicle;

        if (!vehicle) {
          return <span className="text-muted-foreground">-</span>;
        }

        const plate = vehicle?.plate || "-";
        const brand = vehicle?.model?.brand || "";
        const family = vehicle?.model?.family || "";

        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{plate}</span>
            <span className="text-xs text-muted-foreground">
              {brand} {family}
            </span>
          </div>
        );
      },
    },
    {
      id: "quotation_date",
      header: "Fecha de Cotización",
      cell: ({ row }) => {
        const date = row.original.quotation_date;

        if (!date) return "-";

        try {
          const formattedDate = format(new Date(date), "dd/MM/yyyy", {
            locale: es,
          });
          return (
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{formattedDate}</span>
            </div>
          );
        } catch {
          return date;
        }
      },
    },
    {
      accessorKey: "total_amount",
      header: "Monto Total",
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <DollarSign className="h-3.5 w-3.5 text-green-600" />
            <span className="font-semibold text-green-700">
              S/ {value.toFixed(2)}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-[85vw] md:w-[80vw] lg:w-[75vw] xl:w-[70vw] 2xl:max-w-[1400px] h-[85vh] sm:h-[80vh] md:h-[75vh] lg:h-[80vh] overflow-hidden flex flex-col p-3 sm:p-4 md:p-5 lg:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Seleccionar Cotización
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-3 sm:space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-2 flex-wrap">
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
          <QuotationSelectionTable
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            initialColumnVisibility={{
              quotation_number: true,
              customer: true,
              vehicle: true,
              quotation_date: true,
              total_amount: true,
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
