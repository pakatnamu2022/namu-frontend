import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, PlayCircle, Wallet, XCircle, Pencil } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { PlansResource } from "../lib/plans.interface";
import { PLANS, PLAN_STATUS_OPTIONS } from "../lib/plans.constants";

export type PlansColumns = ColumnDef<PlansResource>;

interface Props {
  onDelete: (id: number) => void;
  onActivate: (id: number) => void;
  onComplete: (id: number) => void;
  onCancel: (id: number) => void;
  onManageBudgets: (plan: PlansResource) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const plansColumns = ({
  onDelete,
  onActivate,
  onComplete,
  onCancel,
  onManageBudgets,
  permissions,
}: Props): PlansColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <p className="font-semibold">{getValue() as string}</p>
    ),
  },
  {
    accessorKey: "concept",
    header: "Concepto",
    cell: ({ getValue }) => (getValue() as string) || "-",
  },
  {
    id: "brand",
    header: "Marca",
    cell: ({ row }) => row.original.brand?.name ?? "-",
  },
  {
    accessorKey: "year",
    header: "Año",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const value = row.original.status;
      if (!value) return <span className="text-muted-foreground">-</span>;
      const label =
        row.original.status_label ??
        (PLAN_STATUS_OPTIONS.find((s) => s.value === value)?.label as string) ??
        value;
      const colorMap: Record<string, "default" | "secondary" | "destructive"> = {
        draft: "secondary",
        active: "default",
        closed: "secondary",
        cancelled: "destructive",
      };
      return (
        <Badge color={colorMap[value] ?? "secondary"} className="capitalize">
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
      const { ROUTE_UPDATE } = PLANS;

      const status = row.original.status;

      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={Wallet}
            tooltip="Presupuestos"
            type="button"
            onClick={() => onManageBudgets(row.original)}
          />
          {permissions.canUpdate && status === "draft" && (
            <ButtonAction
              icon={PlayCircle}
              tooltip="Activar plan"
              type="button"
              onClick={() => onActivate(id)}
            />
          )}
          {permissions.canUpdate && status === "active" && (
            <ButtonAction
              icon={CheckCircle2}
              tooltip="Completar plan (genera OC)"
              type="button"
              onClick={() => onComplete(id)}
            />
          )}
          {permissions.canUpdate && (status === "draft" || status === "active") && (
            <ButtonAction
              icon={XCircle}
              tooltip="Cancelar plan"
              type="button"
              onClick={() => onCancel(id)}
            />
          )}
          {permissions.canUpdate && (
            <ButtonAction
              icon={Pencil}
              tooltip="Editar"
              type="button"
              onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
            />
          )}
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
