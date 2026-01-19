import type { ColumnDef } from "@tanstack/react-table";
import { SupplierOrderResource } from "../lib/supplierOrder.interface";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, FileCheck } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export type SupplierOrderColumns = ColumnDef<SupplierOrderResource>;

interface Props {
  onDelete: (id: number) => void;
  onView?: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
    canView: boolean;
  };
  routeUpdate?: string;
  routeInvoice?: string;
}

export const supplierOrderColumns = ({
  onDelete,
  onView,
  permissions,
  routeUpdate,
  routeInvoice,
}: Props): SupplierOrderColumns[] => [
  {
    accessorKey: "order_number",
    header: "Nº Pedido",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
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
    header: "Asocio Factura",
    cell: ({ getValue }) => {
      const isTake = getValue() as boolean;
      return (
        <Badge variant={isTake ? "default" : "secondary"}>
          {isTake ? "Si" : "No"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, is_take, has_invoice } = row.original;
      const canEditDelete = !is_take; // Disable edit/delete if already taken

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

          {routeInvoice && !has_invoice && (
            <Link to={`${routeInvoice}/${id}`}>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                tooltip="Facturación de la Orden"
              >
                <FileCheck className="size-4" />
              </Button>
            </Link>
          )}

          {permissions.canUpdate &&
            !has_invoice &&
            canEditDelete &&
            routeUpdate && (
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

          {permissions.canDelete && !has_invoice && canEditDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
