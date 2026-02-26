import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Download,
  Eye,
  PackageOpen,
  XCircle,
  Percent,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { errorToast, successToast } from "@/core/core.function";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";
import { downloadOrderQuotationRepuestoPdf } from "../../../taller/cotizacion/lib/proforma.actions";
import { useState } from "react";
import { DiscardQuotationModal } from "./DiscardQuotationModal";
import { STATUS_ORDER_QUOTATION } from "../../../taller/cotizacion/lib/proforma.constants";

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
    accessorKey: "supply_type",
    header: "Abastecimiento",
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
    cell: ({ row }) => {
      const {
        id,
        has_invoice_generated,
        is_fully_paid,
        output_generation_warehouse,
        status,
      } = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [showDiscardModal, setShowDiscardModal] = useState(false);

      const isDiscarded = status === "Descartado";

      const isForInvoicing = status === "Por Facturar";

      const handleDownloadPdf = async (withCode: boolean) => {
        try {
          await downloadOrderQuotationRepuestoPdf(id, withCode);
          successToast(
            `PDF descargado correctamente ${
              withCode ? "con código" : "sin código"
            }`,
          );
        } catch {
          errorToast("Error al descargar el PDF");
        }
      };

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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  tooltip="Descargar PDF"
                >
                  <Download className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownloadPdf(true)}>
                  <Download className="size-4 mr-2" />
                  PDF con código
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadPdf(false)}>
                  <Download className="size-4 mr-2" />
                  PDF sin código
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isDiscarded && is_fully_paid && (
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                tooltip={
                  output_generation_warehouse
                    ? "Ver Entrega"
                    : "Generar Entrega"
                }
                onClick={() => onViewDelivery(row.original)}
              >
                <PackageOpen className="size-5" />
              </Button>
            )}

            {!isDiscarded && !has_invoice_generated && !isForInvoicing && (
              <Button
                variant="outline"
                size="icon"
                className="size-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                tooltip="Solicitar Descuento"
                onClick={() => onRequestDiscount(id)}
              >
                <Percent className="size-5" />
              </Button>
            )}

            {!isDiscarded && !has_invoice_generated && (
              <Button
                variant="outline"
                size="icon"
                className="size-7 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                tooltip="Descartar Cotización"
                onClick={() => setShowDiscardModal(true)}
              >
                <XCircle className="size-5" />
              </Button>
            )}

            {!isDiscarded &&
              !isForInvoicing &&
              permissions.canUpdate &&
              !has_invoice_generated && (
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

            {!isDiscarded &&
              !isForInvoicing &&
              permissions.canDelete &&
              !has_invoice_generated && (
                <DeleteButton onClick={() => onDelete(id)} />
              )}
          </div>

          <DiscardQuotationModal
            open={showDiscardModal}
            onClose={() => setShowDiscardModal(false)}
            quotationId={id}
            onSuccess={onRefresh}
          />
        </>
      );
    },
  },
];
