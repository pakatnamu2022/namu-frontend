import type { ColumnDef } from "@tanstack/react-table";
import { PurchaseOrderProductsResource } from "../lib/purchaseOrderProducts.interface";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { PURCHASE_ORDER_STATUS_COLORS } from "../lib/purchaseOrderProducts.constants";
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
  };
  routeUpdate?: string;
}

export const purchaseOrderProductsColumns = ({
  onDelete,
  onView,
  permissions,
  routeUpdate,
}: Props): PurchaseOrderProductsColumns[] => [
  {
    accessorKey: "order_number",
    header: "Nº Orden",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "supplier_name",
    header: "Proveedor",
    cell: ({ getValue, row }) => {
      const value = getValue() as string;
      const numDoc = row.original.supplier_num_doc;
      return (
        <div className="flex flex-col">
          <p className="font-medium">{value}</p>
          {numDoc && <p className="text-xs text-muted-foreground">{numDoc}</p>}
        </div>
      );
    },
  },
  {
    accessorKey: "order_date",
    header: "F. Orden",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        return format(new Date(value), "dd/MM/yyyy", { locale: es });
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "expected_delivery_date",
    header: "F. Entrega Esperada",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        return format(new Date(value), "dd/MM/yyyy", { locale: es });
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ getValue }) => {
      const value = getValue();
      if (value == null || value === "") return "S/ 0.00";
      const numValue =
        typeof value === "string" ? parseFloat(value) : Number(value);
      return isNaN(numValue) ? (
        "S/ 0.00"
      ) : (
        <p className="font-semibold">S/ {numValue.toFixed(2)}</p>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as
        | "PENDING"
        | "APPROVED"
        | "RECEIVED"
        | "CANCELLED";

      const statusConfig = {
        PENDING: "Pendiente",
        APPROVED: "Aprobado",
        RECEIVED: "Recibido",
        CANCELLED: "Cancelado",
      };

      return (
        <Badge
          className={`capitalize w-28 flex items-center justify-center ${PURCHASE_ORDER_STATUS_COLORS[value]}`}
        >
          {statusConfig[value] || value}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, status } = row.original;
      const canEdit = status === "PENDING";

      return (
        <div className="flex items-center gap-2">
          {permissions.canView && onView && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onView(id)}
            >
              <Eye className="size-5" />
            </Button>
          )}

          {permissions.canUpdate && canEdit && routeUpdate && (
            <Link to={`${routeUpdate}/${id}`}>
              <Button variant="outline" size="icon" className="size-7">
                <Pencil className="size-5" />
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
