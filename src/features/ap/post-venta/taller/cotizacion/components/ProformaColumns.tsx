import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Download, Settings } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { errorToast } from "@/core/core.function";
import { OrderQuotationResource } from "../lib/proforma.interface";
import { downloadOrderQuotationPdf } from "../lib/proforma.actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type OrderQuotationColumns = ColumnDef<OrderQuotationResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onManage: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const orderQuotationColumns = ({
  onUpdate,
  onDelete,
  onManage,
  permissions,
}: Props): OrderQuotationColumns[] => [
  {
    accessorKey: "quotation_number",
    header: "Número de Cotización",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "quotation_date",
    header: "Fecha de Cotización",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (!date) return "-";
      try {
        return format(new Date(date), "dd/MM/yyyy", { locale: es });
      } catch {
        return date;
      }
    },
  },
  {
    accessorKey: "expiration_date",
    header: "Fecha de Vencimiento",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (!date) return "-";
      try {
        return format(new Date(date), "dd/MM/yyyy", { locale: es });
      } catch {
        return date;
      }
    },
  },
  {
    accessorKey: "vehicle.plate",
    header: "Placa",
  },
  {
    accessorKey: "total_amount",
    header: "Total Monto",
    cell: ({ getValue }) => {
      const amount = getValue() as number;
      return `S/. ${Number(amount || 0).toFixed(2)}`;
    },
  },
  {
    accessorKey: "observations",
    header: "Observaciones",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      const handleDownloadPdf = async () => {
        try {
          await downloadOrderQuotationPdf(id);
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
            onClick={() => onManage(id)}
            tooltip="Gestionar"
          >
            <Settings className="size-5" />
          </Button>

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
