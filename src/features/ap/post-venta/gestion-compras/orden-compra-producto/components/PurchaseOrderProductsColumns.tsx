import type { ColumnDef } from "@tanstack/react-table";
import { PurchaseOrderProductsResource } from "../lib/purchaseOrderProducts.interface";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, PackageCheck } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  routeUpdate?: string;
  routeReception?: string;
}

export const purchaseOrderProductsColumns = ({
  onDelete,
  onView,
  permissions,
  routeUpdate,
  routeReception,
}: Props): PurchaseOrderProductsColumns[] => [
  {
    accessorKey: "number",
    header: "Nº Orden",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold text-xs">{value}</p>;
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
          <p className="font-medium text-xs">
            {series}-{number}
          </p>
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
          <p className="font-medium text-xs">{value}</p>
          {numDoc && (
            <p className="text-[10px] text-muted-foreground">RUC: {numDoc}</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "emission_date",
    header: "F. Emisión",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        return (
          <span className="text-xs">
            {format(new Date(value), "dd/MM/yyyy", { locale: es })}
          </span>
        );
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "due_date",
    header: "F. Vencimiento",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        return (
          <span className="text-xs">
            {format(new Date(value), "dd/MM/yyyy", { locale: es })}
          </span>
        );
      } catch {
        return value;
      }
    },
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
        <p className="font-semibold text-xs">
          {symbol} {numValue.toFixed(2)}
        </p>
      );
    },
  },
  {
    accessorKey: "sede",
    header: "Sede",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="text-xs">{value}</p>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, status } = row.original;
      const canEdit = status === true;

      return (
        <div className="flex items-center gap-2">
          {permissions.canView && onView && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
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
                title="Recepción"
              >
                <PackageCheck className="size-4" />
              </Button>
            </Link>
          )}

          {permissions.canUpdate && canEdit && routeUpdate && (
            <Link to={`${routeUpdate}/${id}`}>
              <Button variant="outline" size="icon" className="size-7">
                <Pencil className="size-4" />
              </Button>
            </Link>
          )}

          {permissions.canDelete && canEdit && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
