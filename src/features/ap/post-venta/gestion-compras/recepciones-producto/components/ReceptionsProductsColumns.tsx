import type { ColumnDef } from "@tanstack/react-table";
import { ReceptionListItem } from "../lib/receptionsProducts.interface";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type ReceptionsProductsColumns = ColumnDef<ReceptionListItem>;

interface Props {
  onDelete: (id: number) => void;
  onView?: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
    canView: boolean;
  };
  routeUpdate?: string;
  purchaseOrderNumber?: string;
  warehouseName?: string;
}

export const receptionsProductsColumns = ({
  onDelete,
  onView,
  permissions,
  routeUpdate,
  purchaseOrderNumber,
  warehouseName,
}: Props): ReceptionsProductsColumns[] => [
  {
    accessorKey: "reception_number",
    header: "Nº Recepción",
    cell: ({ row }) => {
      const value = row.original.reception_number;
      return value ? <p className="font-semibold">{value}</p> : "-";
    },
  },
  {
    accessorKey: "purchase_order_id",
    header: "Nº Orden de Compra",
    cell: () => {
      return purchaseOrderNumber ? (
        <p className="font-semibold">{purchaseOrderNumber}</p>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "reception_date",
    header: "Fecha de Recepción",
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
    accessorKey: "warehouse_id",
    header: "Almacén",
    cell: () => {
      return warehouseName || "-";
    },
  },
  {
    accessorKey: "shipping_guide_number",
    header: "Nº Guía de Remisión",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    accessorKey: "total_items",
    header: "Total Items",
    cell: ({ row }) => {
      const value = row.original.total_items;
      return value !== undefined ? value : "-";
    },
  },
  {
    accessorKey: "received_by_user_name",
    header: "Recibido por",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

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

          {permissions.canUpdate && routeUpdate && (
            <Link to={`${routeUpdate}/${id}`}>
              <Button variant="outline" size="icon" className="size-7">
                <Pencil className="size-5" />
              </Button>
            </Link>
          )}

          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
