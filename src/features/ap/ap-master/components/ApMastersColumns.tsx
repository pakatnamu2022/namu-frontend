import { ColumnDef } from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { ApMastersResource } from "../lib/apMasters.interface";

interface ApMastersColumnsProps {
  onToggleStatus: (id: number, newStatus: boolean) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  permissions: any;
}

export const commercialMastersColumns = ({
  onToggleStatus,
  onDelete,
  onUpdate,
  permissions,
}: ApMastersColumnsProps): ColumnDef<ApMastersResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
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
  },
  {
    accessorKey: "status",
    header: "Estado",
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.original.status ?? true;
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
