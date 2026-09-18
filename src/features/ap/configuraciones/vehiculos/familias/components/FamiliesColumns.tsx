import type { ColumnDef } from "@tanstack/react-table";
import { FamiliesResource } from "../lib/families.interface";
import { Button } from "@/components/ui/button";
import { ImagePlus, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type FamiliesColumns = ColumnDef<FamiliesResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onUploadImage: (family: FamiliesResource) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const familiesColumns = ({
  onUpdate,
  onDelete,
  onUploadImage,
  onToggleStatus,
  permissions,
}: Props): FamiliesColumns[] => [
  {
    accessorKey: "code",
    header: "Cod.",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "image",
    header: "Imagen",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value ? (
        <img
          src={value}
          alt="Familia"
          className="h-10 w-16 object-contain"
          loading="lazy"
        />
      ) : (
        <span className="text-xs text-muted-foreground">Sin imagen</span>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "brand",
    header: "Marca",
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
      const family = row.original;

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

          {/* Imagen */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Subir imagen"
              onClick={() => onUploadImage(family)}
            >
              <ImagePlus className="size-5" />
            </Button>
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
