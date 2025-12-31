import { ColumnDef } from "@tanstack/react-table";
import { CommercialMastersResource } from "../lib/commercialMasters.interface";
import { DeleteButton, UpdateButton } from "@/shared/components/ActionButtons";
import { Switch } from "@/components/ui/switch";

interface CommercialMastersColumnsProps {
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
}: CommercialMastersColumnsProps): ColumnDef<CommercialMastersResource>[] => [
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
          <UpdateButton onClick={() => onUpdate(row.original.id)} />
        )}
        {permissions.canDelete && (
          <DeleteButton onClick={() => onDelete(row.original.id)} />
        )}
      </div>
    ),
  },
];
