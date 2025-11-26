import type { ColumnDef } from "@tanstack/react-table";
import { ProductTransferResource } from "../lib/productTransfer.interface";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export type ProductTransferColumns = ColumnDef<ProductTransferResource>;

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

export const productTransferColumns = ({
  onDelete,
  onView,
  permissions,
  routeUpdate,
}: Props): ProductTransferColumns[] => [
  {
    accessorKey: "movement_number",
    header: "N° Movimiento",
  },
  {
    accessorKey: "movement_date",
    header: "Fecha de Movimiento",
  },
  {
    accessorKey: "warehouse_code",
    header: "Almacén Origen",
  },
  {
    accessorKey: "warehouse_destination_code",
    header: "Almacén Destino",
  },
  {
    accessorKey: "user_name",
    header: "Registrado Por",
  },
  {
    accessorKey: "notes",
    header: "Observaciones",
  },
  {
    accessorKey: "movement_type",
    header: "Tipo Movimiento",
    cell: () => {
      return (
        <Badge
          variant="default"
          className="capitalize w-28 flex items-center justify-center"
        >
          TRANSFERENCIA
        </Badge>
      );
    },
  },
  {
    accessorKey: "total_items",
    header: "Total de Ítems",
  },
  {
    accessorKey: "total_quantity",
    header: "Cantidad Total",
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
