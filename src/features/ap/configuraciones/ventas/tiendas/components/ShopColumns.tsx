import type { ColumnDef } from "@tanstack/react-table";
import { ShopResource, ShopSedeResource } from "../lib/shop.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type ShopColumns = ColumnDef<ShopResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const shopColumns = ({
  onUpdate,
  onDelete,
  onToggleStatus,
  permissions,
}: Props): ShopColumns[] => [
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "sedes",
    header: "Sedes",
    cell: ({ getValue }) => {
      const sedes = getValue() as ShopSedeResource[];
      if (!sedes || sedes.length === 0) {
        return <span className="text-gray-400 italic">Sin sedes</span>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {sedes.map((sede) => (
            <span
              key={sede.id}
              className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
            >
              {sede.abreviatura}
            </span>
          ))}
        </div>
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
      const { id, status } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Toggle Status */}
          {permissions.canUpdate && (
            <Switch
              checked={status}
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
              onClick={() => onUpdate(id)}
              disabled={!status}
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
