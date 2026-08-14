import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { MONTH_OPTIONS } from "@/core/core.constants";
import { KpisResource } from "../lib/kpis.interface";
import { KPIS } from "../lib/kpis.constants";

export type KpisColumns = ColumnDef<KpisResource>;

interface Props {
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const kpisColumns = ({ onDelete, permissions }: Props): KpisColumns[] => [
  {
    id: "activity",
    header: "Actividad",
    cell: ({ row }) => row.original.activity?.name ?? "-",
  },
  {
    id: "period",
    header: "Periodo",
    cell: ({ row }) => {
      const { period_month, period_year } = row.original;
      if (!period_month && !period_year) return "-";
      const monthLabel = MONTH_OPTIONS.find((m) => m.value === period_month?.toString())?.label;
      return `${monthLabel ?? ""} ${period_year ?? ""}`.trim();
    },
  },
  {
    accessorKey: "leads",
    header: "Leads",
    cell: ({ getValue }) => (getValue() as number | null) ?? "-",
  },
  {
    accessorKey: "sales",
    header: "Ventas",
    cell: ({ getValue }) => (getValue() as number | null) ?? "-",
  },
  {
    accessorKey: "investment",
    header: "Inversión",
    cell: ({ row }) => {
      const { investment, currency } = row.original;
      if (investment === null) return "-";
      return `${currency?.symbol ?? ""} ${Number(investment).toFixed(2)}`;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id } = row.original;
      const { ROUTE_UPDATE } = KPIS;

      return (
        <div className="flex items-center gap-2">
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
