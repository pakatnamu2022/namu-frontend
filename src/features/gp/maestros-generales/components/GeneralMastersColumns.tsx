import { ColumnDef } from "@tanstack/react-table";
import { GeneralMastersResource } from "../lib/generalMasters.interface";
import { Switch } from "@/components/ui/switch";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface GeneralMastersColumnsProps {
  onToggleStatus: (id: number, newStatus: boolean) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  permissions: any;
}

export const generalMastersColumns = ({
  onToggleStatus,
  onDelete,
  onUpdate,
  permissions,
}: GeneralMastersColumnsProps): ColumnDef<GeneralMastersResource>[] => [
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
    accessorKey: "value",
    header: "Valor",
    cell: ({ row }) => row.original.value || "-",
  },
  {
    accessorKey: "status",
    header: "Estado",
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.original.status === 1;
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
