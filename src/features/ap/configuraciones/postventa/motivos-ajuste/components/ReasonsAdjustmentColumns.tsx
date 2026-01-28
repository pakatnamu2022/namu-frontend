import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { cn } from "@/lib/utils.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { ReasonsAdjustmentResource } from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.interface.ts";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants";

export type ReasonsAdjustmentColumns = ColumnDef<ReasonsAdjustmentResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const reasonsAdjustmentColumns = ({
  onUpdate,
  onDelete,
  onToggleStatus,
  permissions,
}: Props): ReasonsAdjustmentColumns[] => [
  {
    accessorKey: "code",
    header: "Cod.",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "type",
    header: "Tipo",
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
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge
          color={value ? "default" : "secondary"}
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
              onCheckedChange={(checked) => onToggleStatus(id, checked)}
              className={cn(status ? "bg-primary" : "bg-secondary")}
            />
          )}

          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onUpdate(id)}
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
