import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";
import { CopyCell } from "@/shared/components/CopyCell";
import { STATUS_ORDER_QUOTE_COLOR } from "../../../taller/cotizacion/lib/proforma.constants";

export type OrderQuotationMesonCajaColumns = ColumnDef<OrderQuotationResource>;

interface Props {
  onBilling: (id: number) => void;
  onRefresh?: () => void;
  permissions: {
    canBill: boolean;
  };
}

export const orderQuotationMesonCajaColumns = ({
  onBilling,
  permissions,
}: Props): OrderQuotationMesonCajaColumns[] => [
  {
    accessorKey: "quotation_number",
    header: "Número de Cotización",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <CopyCell className="font-semibold" value={value} />;
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
    accessorKey: "collection_date",
    header: "Fecha de Recojo",
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
    accessorKey: "client.full_name",
    header: "Cliente",
  },
  {
    accessorKey: "vehicle.plate",
    header: "Placa",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    accessorKey: "type_currency.name",
    header: "Moneda",
  },
  {
    accessorKey: "total_amount",
    header: "Total Monto",
    cell: ({ getValue, row }) => {
      const amount = getValue() as number;
      const currencySymbol = row.original.type_currency?.symbol || "S/.";
      return `${currencySymbol} ${Number(amount || 0).toFixed(2)}`;
    },
  },
  {
    accessorKey: "observations",
    header: "Observaciones",
  },
  {
    accessorKey: "discard_reason",
    header: "Motivo de Descarte",
  },
  {
    accessorKey: "discarded_note",
    header: "Notas de Descarte",
  },
  {
    accessorKey: "discarded_by_name",
    header: "Descartado Por",
  },
  {
    accessorKey: "discarded_at",
    header: "Fecha de Descarte",
  },
  {
    accessorKey: "is_fully_paid",
    header: "Pagado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge
          color={value ? "default" : "secondary"}
          className="capitalize w-8 flex items-center justify-center"
        >
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as OrderQuotationResource["status"];
      if (!status) return "-";

      return (
        <Badge color={STATUS_ORDER_QUOTE_COLOR[status.id] ?? "secondary"}>
          {status.description}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <>
          {permissions.canBill && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Facturar"
              onClick={() => onBilling(id)}
            >
              <Receipt className="size-5" />
            </Button>
          )}
        </>
      );
    },
  },
];
