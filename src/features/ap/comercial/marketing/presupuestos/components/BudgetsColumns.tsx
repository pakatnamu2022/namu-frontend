import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleDollarSign, Pencil } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { MONTH_OPTIONS } from "@/core/core.constants";
import { BudgetsResource } from "../lib/budgets.interface";
import { BUDGETS, BUDGET_TYPE_OPTIONS } from "../lib/budgets.constants";

export type BudgetsColumns = ColumnDef<BudgetsResource>;

interface Props {
  onDelete: (id: number) => void;
  onAddFunding: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const budgetsColumns = ({
  onDelete,
  onAddFunding,
  permissions,
}: Props): BudgetsColumns[] => [
  {
    id: "plan",
    header: "Plan",
    cell: ({ row }) => row.original.plan?.name ?? "-",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const value = row.original.type;
      const label =
        row.original.type_label ??
        (BUDGET_TYPE_OPTIONS.find((t) => t.value === value)?.label as string) ??
        value;
      return <span className="capitalize">{label}</span>;
    },
  },
  {
    accessorKey: "period_month",
    header: "Mes",
    cell: ({ getValue }) => {
      const value = getValue() as number | null;
      if (!value) return "-";
      return MONTH_OPTIONS.find((m) => m.value === value.toString())?.label ?? value;
    },
  },
  {
    accessorKey: "amount_estimated",
    header: "Monto Estimado",
    cell: ({ row }) => {
      const { amount_estimated, currency } = row.original;
      return `${currency?.symbol ?? ""} ${Number(amount_estimated).toFixed(2)}`;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const value = row.original.status;
      if (!value) return <span className="text-muted-foreground">-</span>;
      const label = row.original.status_label ?? value;
      return (
        <Badge color={value === "approved" ? "default" : "secondary"} className="capitalize">
          {label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id } = row.original;
      const { ROUTE_UPDATE } = BUDGETS;

      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={CircleDollarSign}
            tooltip="Agregar financiamiento"
            type="button"
            onClick={() => onAddFunding(id)}
          />
          {permissions.canUpdate && (
            <ButtonAction
              icon={Pencil}
              tooltip="Editar"
              type="button"
              onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
            />
          )}
          {permissions.canDelete && <DeleteButton onClick={() => onDelete(id)} />}
        </div>
      );
    },
  },
];
