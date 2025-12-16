import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { TypeGenderResource } from "../lib/typesGender.interface";

export type TypeGenderColumns = ColumnDef<TypeGenderResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const typeGenderColumns = ({
  onUpdate,
  onDelete,
  onToggleStatus,
  permissions,
}: Props): TypeGenderColumns[] => [
  {
    accessorKey: "description",
    header: "Nombre",
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
