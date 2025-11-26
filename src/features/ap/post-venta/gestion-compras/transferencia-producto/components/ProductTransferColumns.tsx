import type { ColumnDef } from "@tanstack/react-table";
import { ProductTransferResource } from "../lib/productTransfer.interface";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
    accessorKey: "id",
    header: "ID",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <p className="font-semibold">#{value}</p>;
    },
  },
  {
    accessorKey: "movement_date",
    header: "Fecha de Movimiento",
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
    accessorKey: "warehouse_origin",
    header: "Almacén Origen",
    cell: ({ row }) => {
      const warehouse = row.original.warehouse_origin;
      return warehouse?.description || "-";
    },
  },
  {
    accessorKey: "warehouse_destination",
    header: "Almacén Destino",
    cell: ({ row }) => {
      const warehouse = row.original.warehouse_destination;
      return warehouse?.description || "-";
    },
  },
  {
    accessorKey: "transfer_reason",
    header: "Motivo de Traslado",
    cell: ({ row }) => {
      const reason = row.original.transfer_reason;
      return reason?.description || "-";
    },
  },
  {
    accessorKey: "driver_name",
    header: "Conductor",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    accessorKey: "plate",
    header: "Placa",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "total_packages",
    header: "Bultos",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value || "-";
    },
  },
  {
    accessorKey: "total_weight",
    header: "Peso Total",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value ? `${value} kg` : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Activo" : "Inactivo"}
        </Badge>
      );
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
