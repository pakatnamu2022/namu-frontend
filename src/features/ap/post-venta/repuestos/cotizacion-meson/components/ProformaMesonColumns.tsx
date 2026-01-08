import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Download, Receipt, Eye, PackageOpen } from "lucide-react";
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
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog";
import { useState } from "react";
import { createSaleFromQuotation } from "../../../gestion-compras/inventario/lib/inventory.actions";

export type OrderQuotationMesonColumns = ColumnDef<OrderQuotationResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onBilling: (id: number) => void;
  onViewBilling: (orderQuotation: OrderQuotationResource) => void;
  onRefresh?: () => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const orderQuotationMesonColumns = ({
  onUpdate,
  onDelete,
  onBilling,
  onViewBilling,
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
    enableSorting: false,
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
    enableSorting: false,
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
    enableSorting: false,
  },
  {
    accessorKey: "vehicle.plate",
    header: "Placa",
    enableSorting: false,
  },
  {
    accessorKey: "total_amount",
    header: "Total Monto",
    cell: ({ getValue, row }) => {
      const amount = getValue() as number;
      const currencySymbol = row.original.currency?.symbol || "S/.";
      return `${currencySymbol} ${Number(amount || 0).toFixed(2)}`;
    },
    enableSorting: false,
  },
  {
    accessorKey: "observations",
    header: "Observaciones",
    enableSorting: false,
  },
  {
    accessorKey: "is_fully_paid",
    header: "Pagado",
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
      } = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [showConfirmDialog, setShowConfirmDialog] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isLoading, setIsLoading] = useState(false);

      const handleDownloadPdf = async (withCode: boolean) => {
        try {
          await downloadOrderQuotationRepuestoPdf(id, withCode);
          successToast(
            `PDF descargado correctamente ${
              withCode ? "con código" : "sin código"
            }`
          );
        } catch {
          errorToast("Error al descargar el PDF");
        }
      };

      const handleCreateInventoryMovement = async () => {
        setIsLoading(true);
        try {
          await createSaleFromQuotation(id);
          successToast("Salida de inventario generada correctamente");
          setShowConfirmDialog(false);
          onRefresh?.();
        } catch (error: any) {
          const msg =
            error?.response?.data?.message ||
            "Error al generar la salida de inventario";
          errorToast(msg);
        } finally {
          setIsLoading(false);
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

            {!is_fully_paid && (
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

            {is_fully_paid && !output_generation_warehouse && (
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                tooltip="Generar Salida de Inventario"
                onClick={() => setShowConfirmDialog(true)}
              >
                <PackageOpen className="size-5" />
              </Button>
            )}

            {permissions.canUpdate && !has_invoice_generated && (
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

            {permissions.canDelete && !has_invoice_generated && (
              <DeleteButton onClick={() => onDelete(id)} />
            )}
          </div>

          <SimpleConfirmDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
            onConfirm={handleCreateInventoryMovement}
            title="¿Confirmar salida de inventario?"
            description="¿Estás seguro de que deseas generar la salida de inventario para esta cotización? Esta acción registrará el movimiento de los repuestos."
            confirmText="Sí, generar salida"
            cancelText="Cancelar"
            icon="warning"
            isLoading={isLoading}
          />
        </>
      );
    },
  },
];
