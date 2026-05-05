import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";
import { STATUS_ORDER_QUOTATION } from "../../../taller/cotizacion/lib/proforma.constants";
import { ProformaMesonActionsCell } from "./ProformaMesonActionsCell";

export type OrderQuotationMesonColumns = ColumnDef<OrderQuotationResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onViewBilling: (orderQuotation: OrderQuotationResource) => void;
  onViewDelivery: (orderQuotation: OrderQuotationResource) => void;
  onRequestDiscount: (id: number) => void;
  onRefresh?: () => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const orderQuotationMesonColumns = ({
  onUpdate,
  onDelete,
  onViewBilling,
  onViewDelivery,
  onRequestDiscount,
  onRefresh,
  permissions,
}: Props): OrderQuotationMesonColumns[] => [
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
          variant="outline"
          color={value ? "green" : "red"}
          className="capitalize w-8 flex items-center justify-center"
        >
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "has_management_discount",
    header: "Dcto. Gerencial",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge
          variant="outline"
          color={value ? "green" : "gray"}
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
      const status = getValue() as string;

      const getStatusBadge = (status: string) => {
        switch (status) {
          case STATUS_ORDER_QUOTATION.DISCARDED:
            return <Badge color="red">{status}</Badge>;
          case STATUS_ORDER_QUOTATION.OPEN:
            return <Badge color="indigo">{status}</Badge>;
          case STATUS_ORDER_QUOTATION.TO_BILL:
            return <Badge color="orange">{status}</Badge>;
          case STATUS_ORDER_QUOTATION.BILLED:
            return <Badge color="green">{status}</Badge>;
          default:
            return <Badge color="secondary">{status}</Badge>;
        }
      };

      return getStatusBadge(status);
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <ProformaMesonActionsCell
        row={row.original}
        permissions={permissions}
        onViewBilling={onViewBilling}
        onViewDelivery={onViewDelivery}
        onRequestDiscount={onRequestDiscount}
        onRefresh={onRefresh!}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    ),
  },
];
