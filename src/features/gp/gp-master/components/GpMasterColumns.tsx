import { ColumnDef } from "@tanstack/react-table";
import { GpMastersResource } from "../lib/gpMaster.interface";
import { Switch } from "@/components/ui/switch";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Button } from "@/components/ui/button";
import {
  GpMasterTypeConfig,
  getGpMasterTypeConfig,
} from "../lib/gpMaster.constants";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";

interface GpMasterColumnsProps {
  onToggleStatus: (id: number, newStatus: boolean) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  permissions: any;
  typeConfig?: Record<string, GpMasterTypeConfig>;
}

export const gpMasterColumns = ({
  onToggleStatus,
  onDelete,
  onUpdate,
  permissions,
  typeConfig,
}: GpMasterColumnsProps): ColumnDef<GpMastersResource>[] => [
  {
    accessorKey: "code",
    header: "Código",
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.original.type;
      const config = typeConfig?.[type] ?? getGpMasterTypeConfig(type);
      return (
        <Badge variant="outline" color={config.color}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = Boolean(row.original.status);
      return (
        <Switch
          checked={status}
          onCheckedChange={(checked) =>
            onToggleStatus(row.original.id, checked)
          }
          disabled={!permissions.canUpdate}
        />
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {permissions.canUpdate && (
          <Button
            size="icon-xs"
            variant="outline"
            onClick={() => onUpdate(row.original.id)}
            aria-label="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        {permissions.canDelete && (
          <DeleteButton onClick={() => onDelete(row.original.id)} />
        )}
      </div>
    ),
  },
];
