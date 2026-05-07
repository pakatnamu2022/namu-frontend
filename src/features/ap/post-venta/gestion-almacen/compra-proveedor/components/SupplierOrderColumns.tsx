import type { ColumnDef } from "@tanstack/react-table";
import { SupplierOrderResource } from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.interface.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { CopyCell } from "@/shared/components/CopyCell";
import {
  RECEPCION_TYPE_LABELS,
  RECEPCION_STATUS_COLORS,
} from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.constants.ts";
import { SupplierOrderActionsCell } from "./SupplierOrderActionsCell";

export type SupplierOrderColumns = ColumnDef<SupplierOrderResource>;

interface Props {
  onDelete: (id: number) => void;
  onView?: (id: number) => void;
  onApprove: (id: number) => void;
  onDownloadPdf: (id: number) => Promise<void>;
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
  onApprove,
  onDownloadPdf,
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
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge
          variant="outline"
          color={value ? "green" : "red"}
          className="w-fit"
        >
          {value ? "Activo" : "Anulado"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <SupplierOrderActionsCell
        row={row.original}
        onDelete={onDelete}
        onView={onView}
        onApprove={onApprove}
        onDownloadPdf={onDownloadPdf}
        permissions={permissions}
        routeUpdate={routeUpdate}
        routeReception={routeReception}
      />
    ),
  },
];
