import type { ColumnDef } from "@tanstack/react-table";
import { PurchaseOrderProductsResource } from "../lib/purchaseOrderProducts.interface";
import { Button } from "@/components/ui/button";
import { Eye, PackageCheck } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Link } from "react-router-dom";

export type PurchaseOrderProductsColumns =
  ColumnDef<PurchaseOrderProductsResource>;

interface Props {
  onDelete: (id: number) => void;
  onView?: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
    canView: boolean;
    canReceive?: boolean;
  };
  routeReception?: string;
}

export const purchaseOrderProductsColumns = ({
  onDelete,
  onView,
  permissions,
  routeReception,
}: Props): PurchaseOrderProductsColumns[] => [
  {
    accessorKey: "number",
    header: "Nº Orden",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "invoice_series",
    header: "Factura",
    cell: ({ row }) => {
      const series = row.original.invoice_series;
      const number = row.original.invoice_number;
      return (
        <div className="flex flex-col">
          {series}-{number}
        </div>
      );
    },
  },
  {
    accessorKey: "supplier",
    header: "Proveedor",
    cell: ({ getValue, row }) => {
      const value = getValue() as string;
      const numDoc = row.original.supplier_num_doc;
      return (
        <div className="flex flex-col">
          <p className="font-medium">{value}</p>
          {numDoc && (
            <p className="text-[12px] text-muted-foreground">RUC: {numDoc}</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "emission_date",
    header: "F. Emisión",
  },
  {
    accessorKey: "due_date",
    header: "F. Vencimiento",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ getValue, row }) => {
      const value = getValue();
      const currencyCode = row.original.currency_code || "PEN";
      const symbol = currencyCode === "USD" ? "$" : "S/.";

      if (value == null || value === "") return `${symbol} 0.00`;
      const numValue =
        typeof value === "string" ? parseFloat(value) : Number(value);
      return isNaN(numValue) ? (
        `${symbol} 0.00`
      ) : (
        <p className="font-semibold">
          {symbol} {numValue.toFixed(2)}
        </p>
      );
    },
  },
  {
    accessorKey: "sede",
    header: "Sede",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, status, migration_status, has_receptions } = row.original;
      const canEditDelete =
        !has_receptions || migration_status === "completed" || status === true; // Disable edit/delete if there are receptions

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

          {permissions.canReceive && routeReception && (
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

          {permissions.canDelete && canEditDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
