import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { EstablishmentsResource } from "../lib/establishments.interface";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type EstablishmentsColumns = ColumnDef<EstablishmentsResource>;

interface Props {
  onToggleStatus: (id: number, newStatus: boolean) => void;
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
  baseRoute: string;
}

export const establishmentsColumns = ({
  onToggleStatus,
  onDelete,
  permissions,
  baseRoute,
}: Props): EstablishmentsColumns[] => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.getValue("code")}
      </Badge>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return description || <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue("type")}</Badge>
    ),
  },
  {
    accessorKey: "activity_economic",
    header: "Actividad Económica",
    cell: ({ row }) => {
      const activity = row.getValue("activity_economic") as string;
      return activity || <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "full_address",
    header: "Dirección Completa",
    cell: ({ row }) => {
      const address = row.getValue("full_address") as string;
      return (
        <div className="max-w-xs truncate" title={address}>
          {address || <span className="text-muted-foreground">-</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "ubigeo",
    header: "Ubigeo",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.getValue("ubigeo")}
      </Badge>
    ),
  },
  {
    accessorKey: "location",
    header: "Ubicación",
    cell: ({ row }) => {
      const location = row.getValue("location") as string;
      return location || <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "sede",
    header: "Asociado a Sede",
    cell: ({ row }) => {
      const location = row.getValue("sede") as string;
      return location || <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as boolean;
      return (
        <Badge variant={status ? "default" : "destructive"}>
          {status ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useRouter();
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
              tooltip="Editar"
              onClick={() => router.push(`${baseRoute}/${id}`)}
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
