import type { ColumnDef } from "@tanstack/react-table";
import { SupplierOrderResource } from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.interface.ts";
import { Button } from "@/components/ui/button.tsx";
import { Eye, Pencil, PackageCheck, Download, ShieldCheck } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge.tsx";
import { CopyCell } from "@/shared/components/CopyCell";
import {
  RECEPCION_TYPE_LABELS,
  RECEPCION_STATUS_COLORS,
} from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.constants.ts";
import { errorToast, successToast } from "@/core/core.function";
import {
  approveSupplierOrder,
  downloadSupplierOrderPdf,
} from "../lib/supplierOrder.actions";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";

export type SupplierOrderColumns = ColumnDef<SupplierOrderResource>;

interface Props {
  onDelete: (id: number) => void;
  onView?: (id: number) => void;
  permissions: {
    canApprove: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canView: boolean;
  };
  routeUpdate?: string;
  routeReception: string;
}

export const supplierOrderColumns = ({
  onDelete,
  onView,
  permissions,
  routeUpdate,
  routeReception,
}: Props): SupplierOrderColumns[] => [
  {
    accessorKey: "order_number",
    header: "Nº Pedido",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <CopyCell value={value} />;
    },
  },
  {
    accessorKey: "order_number_external",
    header: "N° Orden Dealer Portal",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value == null ? "-" : <CopyCell value={value} />;
    },
  },
  {
    accessorKey: "supplier_id",
    header: "Proveedor",
    cell: ({ row }) => {
      const supplierData = row.original.supplier;
      return (
        <div className="flex flex-col">
          <p className="font-medium">{supplierData?.full_name || "N/A"}</p>
          {supplierData?.num_doc && (
            <p className="text-[12px] text-muted-foreground">
              RUC: {supplierData.num_doc}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "order_date",
    header: "Fecha Pedido",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "N/A";
    },
  },
  {
    accessorKey: "supply_type",
    header: "Tipo Abast.",
  },
  {
    accessorKey: "warehouse_id",
    header: "Almacén",
    cell: ({ row }) => {
      const warehouseData = row.original.warehouse;
      return warehouseData?.description || "N/A";
    },
  },
  {
    accessorKey: "sede_id",
    header: "Sede",
    cell: ({ row }) => {
      const sedeData = row.original.sede;
      return sedeData?.abreviatura || "N/A";
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ getValue, row }) => {
      const amount = getValue() as number;
      const currencySymbol = row.original.type_currency?.symbol || "S/.";
      return `${currencySymbol} ${Number(amount || 0).toFixed(2)}`;
    },
  },
  {
    accessorKey: "has_invoice",
    header: "Factura",
    cell: ({ getValue, row }) => {
      const isTake = getValue() as boolean;
      const invoiceNumbers = row.original.invoice_numbers || [];

      if (!isTake) {
        return (
          <Badge variant="outline" color="red" className="w-fit">
            No
          </Badge>
        );
      }

      return (
        <div className="flex flex-col gap-0.5">
          {invoiceNumbers.map((invoice, index) => (
            <CopyCell key={index} value={invoice} />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "has_invoice",
    header: "OC Dymamic",
    id: "oc_dynamic",
    cell: ({ getValue, row }) => {
      const isTake = getValue() as boolean;
      const invoiceNumbers = row.original.oc_dyn_numbers || [];

      if (!isTake) {
        return (
          <Badge variant="outline" color="red" className="w-fit">
            No
          </Badge>
        );
      }

      return (
        <div className="flex flex-col gap-0.5">
          {invoiceNumbers.map((purchase_order, index) => (
            <CopyCell key={index} value={purchase_order} />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "reception_type",
    header: "Recepción",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "N/A";
      const label = RECEPCION_TYPE_LABELS[value] ?? value;
      const color = RECEPCION_STATUS_COLORS[label] ?? "gray";
      return (
        <Badge variant="outline" color={color} className="w-fit">
          {label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, has_receptions } = row.original;

      const handleDownloadPdf = async (id: number) => {
        try {
          await downloadSupplierOrderPdf(id);
          successToast(
            `PDF descargado correctamente para la solicitud de compra`,
          );
        } catch {
          errorToast("Error al descargar el PDF");
        }
      };

      const handleApprove = async (id: number) => {
        try {
          await approveSupplierOrder(id);
          successToast("Orden aprobada correctamente");
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || "Error al aprobar la orden";
          errorToast(errorMessage);
        }
      };

      return (
        <div className="flex items-center gap-2">
          {permissions.canView && onView && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Ver"
              onClick={() => onView(id)}
            >
              <Eye className="size-4" />
            </Button>
          )}

          {permissions.canApprove && (
            <ConfirmationDialog
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  tooltip="Aprobar"
                >
                  <ShieldCheck className="size-4" />
                </Button>
              }
              title="¿Aprobar orden de compra?"
              description="¿Estás seguro de que deseas aprobar esta orden de compra? Esta acción no se puede deshacer."
              confirmText="Sí, aprobar"
              cancelText="Cancelar"
              icon="info"
              onConfirm={() => handleApprove(id)}
            />
          )}

          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Descargar PDF"
            onClick={() => handleDownloadPdf(id)}
          >
            <Download className="size-5" />
          </Button>

          {permissions.canUpdate && (
            <Link to={`${routeReception}/${id}`}>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                tooltip="Recepcionar"
              >
                <PackageCheck className="size-4" />
              </Button>
            </Link>
          )}

          {permissions.canUpdate && !has_receptions && routeUpdate && (
            <Link to={`${routeUpdate}/${id}`}>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                tooltip="Editar"
              >
                <Pencil className="size-4" />
              </Button>
            </Link>
          )}

          {permissions.canDelete && !has_receptions && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
