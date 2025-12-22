import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { PerDiemRateResource } from "../lib/perDiemRate.interface";
import { PER_DIEM_RATE } from "../lib/perDiemRate.constants";
import { Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type PerDiemRateColumns = ColumnDef<PerDiemRateResource>;

interface Props {
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const perDiemRateColumns = ({
  onDelete,
  onToggleStatus,
  permissions,
}: Props): PerDiemRateColumns[] => [
  {
    accessorKey: "per_diem_policy_name",
    header: "Política de Viáticos",
  },
  {
    accessorKey: "district_name",
    header: "Destino",
  },
  {
    accessorKey: "per_diem_category_name",
    header: "Categoría",
  },
  {
    accessorKey: "expense_type_name",
    header: "Tipo de Gasto",
  },
  {
    accessorKey: "daily_amount",
    header: "Monto Diario",
    cell: ({ row }) => {
      const amount = row.getValue("daily_amount") as number;
      return `S/ ${Number(amount).toFixed(2)}`;
    },
  },
  {
    accessorKey: "active",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.getValue("active") ? "default" : "secondary"}>
        {row.getValue("active") ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id, active } = row.original;
      const { ROUTE_UPDATE } = PER_DIEM_RATE;

      return (
        <div className="flex items-center gap-2">
          {/* Toggle Status */}
          {permissions.canUpdate && (
            <Switch
              checked={active}
              onCheckedChange={(checked) => onToggleStatus(id, checked)}
              className={cn(active ? "bg-primary" : "bg-secondary")}
            />
          )}

          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
              onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
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
