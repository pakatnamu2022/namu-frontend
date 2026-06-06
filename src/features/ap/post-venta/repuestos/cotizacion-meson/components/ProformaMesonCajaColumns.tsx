import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Receipt, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";

export type OrderQuotationMesonCajaColumns = ColumnDef<OrderQuotationResource>;

interface Props {
  onBilling: (id: number) => void;
  onViewBilling: (orderQuotation: OrderQuotationResource) => void;
  onRefresh?: () => void;
  permissions: {
    canBill: boolean;
  };
}

export const orderQuotationMesonCajaColumns = ({
  onBilling,
  onViewBilling,
  permissions,
}: Props): OrderQuotationMesonCajaColumns[] => [
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
      const status = getValue() as string;

      const getStatusBadge = (status: string) => {
        switch (status) {
          case "Descartado":
            return <Badge color="red">{status}</Badge>;
          case "Aperturado":
            return <Badge color="indigo">{status}</Badge>;
          case "Por Facturar":
            return <Badge color="orange">{status}</Badge>;
          case "Facturado":
            return <Badge color="green">{status}</Badge>;
          default:
            return <Badge color="secondary">{status}</Badge>;
        }
      };

      return getStatusBadge(status);
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onViewBilling(row.original)}
              tooltip="Ver Información"
            >
              <Eye className="size-5" />
            </Button>

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
          </div>
        </>
      );
    },
  },
];
