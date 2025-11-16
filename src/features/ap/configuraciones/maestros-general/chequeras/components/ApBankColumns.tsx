import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ApBankResource } from "@/src/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.interface";
import { BANK_AP } from "@/src/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.constants";

export type ApBankColumns = ColumnDef<ApBankResource>;

const { ROUTE_UPDATE } = BANK_AP;

interface Props {
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const apBankColumns = ({
  onDelete,
  onToggleStatus,
  permissions,
}: Props): ApBankColumns[] => [
  {
    accessorKey: "code",
    header: "Cod.",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "account_number",
    header: "Num. Cuenta",
  },
  {
    accessorKey: "cci",
    header: "CCI",
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "currency",
    header: "Moneda",
  },
  {
    accessorKey: "sede",
    header: "Sede",
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
              onClick={() => router.push(`${ROUTE_UPDATE}/${id}`)}
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
