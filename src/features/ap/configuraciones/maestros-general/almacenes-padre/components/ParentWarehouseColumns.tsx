import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ParentWarehouseResource } from "../lib/parentWarehouse.interface";
import { PARENT_WAREHOUSE } from "../lib/parentWarehouse.constants";

export type ParentWarehouseColumns = ColumnDef<ParentWarehouseResource>;

interface Props {
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const parentWarehouseColumns = ({
  onDelete,
  onToggleStatus,
  permissions,
}: Props): ParentWarehouseColumns[] => [
  {
    accessorKey: "dyn_code",
    header: "Cod. Dynamic",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "sede",
    header: "Sede",
  },
  {
    accessorKey: "type_operation",
    header: "Tipo de Operación",
  },
  {
    accessorKey: "is_received",
    header: "¿Es Recepción?",
    cell: ({ getValue }) => {
      const value = getValue() as boolean | null;
      if (value === null)
        return <span className="text-muted-foreground">-</span>;
      return (
        <Badge
          variant={value ? "default" : "secondary"}
          className="capitalize w-8 flex items-center justify-center"
        >
          {value ? "SI" : "NO"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean | null;
      if (value === null)
        return <span className="text-muted-foreground">-</span>;
      return (
        <Badge
          variant={value ? "default" : "secondary"}
          className="capitalize w-20 flex items-center justify-center"
        >
          {value ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id, status } = row.original;
      const { ROUTE_UPDATE } = PARENT_WAREHOUSE;

      return (
        <div className="flex items-center gap-2">
          {/* Toggle Status */}
          {permissions.canUpdate && (
            <Switch
              checked={status ?? false}
              thumbClassName="size-4"
              onCheckedChange={(checked) => onToggleStatus(id, checked)}
              className={cn("h-5 w-9", status ? "bg-primary" : "bg-secondary")}
            />
          )}

          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
            >
              <Pencil className="size-5" />
            </Button>
          )}

          {/* Delete */}
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
