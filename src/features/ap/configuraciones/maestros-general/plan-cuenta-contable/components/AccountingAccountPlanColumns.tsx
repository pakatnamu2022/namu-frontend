import type { ColumnDef } from "@tanstack/react-table";
import { AccountingAccountPlanResource } from "../lib/accountingAccountPlan.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type AccountingAccountPlanColumns =
  ColumnDef<AccountingAccountPlanResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  onToggleDetraction: (id: number, newValue: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const accountingAccountPlanColumns = ({
  onUpdate,
  onDelete,
  onToggleStatus,
  onToggleDetraction,
  permissions,
}: Props): AccountingAccountPlanColumns[] => [
  {
    accessorKey: "account",
    header: "Cuenta",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "code_dynamics",
    header: "Cód. Dyn",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        value && (
          <Badge variant="outline" className="font-semibold font-mono">
            {value}
          </Badge>
        )
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    id: "habilitado_para",
    header: "Habilitado para",
    cell: ({ row }) => {
      const { enable_commercial, enable_after_sales } = row.original;
      return (
        <div className="flex flex-wrap gap-1">
          {enable_commercial && (
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              Comercial
            </Badge>
          )}
          {enable_after_sales && (
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
              Post Venta
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "is_detraction",
    header: "Detracción",
    cell: ({ row }) => {
      const { id, is_detraction, detraction_percentage, status } =
        row.original;
      return (
        <div className="flex items-center gap-2">
          {permissions.canUpdate ? (
            <Switch
              checked={is_detraction}
              disabled={!status}
              onCheckedChange={(checked) => onToggleDetraction(id, checked)}
              className={cn(
                "cursor-pointer",
                is_detraction ? "bg-primary" : "bg-secondary",
                !status && "opacity-50 cursor-not-allowed",
              )}
            />
          ) : (
            <Switch
              checked={is_detraction}
              disabled
              className={cn(
                "cursor-not-allowed",
                is_detraction ? "bg-primary" : "bg-secondary",
              )}
            />
          )}
          {is_detraction && detraction_percentage && (
            <Badge variant="outline">{detraction_percentage}%</Badge>
          )}
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
              className={cn(
                "cursor-pointer",
                status ? "bg-primary" : "bg-secondary",
              )}
            />
          )}

          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
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
