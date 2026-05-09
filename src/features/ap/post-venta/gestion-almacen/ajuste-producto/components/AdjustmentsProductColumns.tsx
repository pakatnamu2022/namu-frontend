import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import { Eye } from "lucide-react";
import { AdjustmentsProductListItem } from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/lib/adjustmentsProduct.interface.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants.ts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type AdjustmentsProductColumns = ColumnDef<AdjustmentsProductListItem>;

interface Props {
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const adjustmentsProductColumns = ({
  onView,
}: Props): AdjustmentsProductColumns[] => [
  {
    accessorKey: "movement_number",
    header: "N° Movimiento",
  },
  {
    accessorKey: "movement_date",
    header: "Fecha de Movimiento",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        const date = new Date(value);
        return format(date, "dd/MM/yyyy", { locale: es });
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "warehouse_code",
    header: "Almacén Origen",
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
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Badge
          color={
            value == AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN ? "default" : "secondary"
          }
          className="capitalize w-20 flex items-center justify-center"
        >
          {value == AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN ? "INGRESO" : "SALIDA"}
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
          {/* View Details */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Ver detalle"
            onClick={() => onView(id)}
          >
            <Eye className="size-5" />
          </Button>

          {/* Edit */}
          {/* {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
              onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
            >
              <Pencil className="size-5" />
            </Button>
          )} */}

          {/* Delete */}
          {/* {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )} */}
        </div>
      );
    },
  },
];
