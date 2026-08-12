import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { MapPin, Pencil, Receipt } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/core/core.function";
import { ActivitiesResource } from "../lib/activities.interface";
import { ACTIVITIES, ACTIVITY_STATUS_OPTIONS } from "../lib/activities.constants";
import { SUPPORTS } from "../../sustentos/lib/supports.constants";

export type ActivitiesColumns = ColumnDef<ActivitiesResource>;

interface Props {
  onDelete: (id: number) => void;
  onChangeStatus: (id: number, status: string) => void;
  onAddLocation: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

const statusColor: Record<string, "default" | "secondary" | "destructive"> = {
  planned: "secondary",
  in_progress: "default",
  executed: "default",
  cancelled: "destructive",
};

export const activitiesColumns = ({
  onDelete,
  onChangeStatus,
  onAddLocation,
  permissions,
}: Props): ActivitiesColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => <p className="font-semibold">{getValue() as string}</p>,
  },
  {
    accessorKey: "activity_type",
    header: "Tipo",
  },
  {
    accessorKey: "responsible",
    header: "Responsable",
    cell: ({ getValue }) => (getValue() as string) || "-",
  },
  {
    id: "dates",
    header: "Fechas",
    cell: ({ row }) => {
      const { start_date, end_date } = row.original;
      if (!start_date) return "-";
      return `${formatDateShort(start_date)} - ${end_date ? formatDateShort(end_date) : "-"}`;
    },
  },
  {
    accessorKey: "estimated_amount",
    header: "Monto Estimado",
    cell: ({ row }) => {
      const { estimated_amount, currency } = row.original;
      return `${currency?.symbol ?? ""} ${Number(estimated_amount).toFixed(2)}`;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const value = row.original.status ?? "";
      if (!permissions.canUpdate) {
        return (
          <Badge color={statusColor[value] ?? "secondary"} className="capitalize">
            {(ACTIVITY_STATUS_OPTIONS.find((s) => s.value === value)?.label as string) ?? value}
          </Badge>
        );
      }
      return (
        <select
          className="text-xs border rounded-md px-2 py-1 bg-background capitalize"
          value={value}
          onChange={(e) => onChangeStatus(row.original.id, e.target.value)}
        >
          {ACTIVITY_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label as string}
            </option>
          ))}
        </select>
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
      const { ROUTE_UPDATE } = ACTIVITIES;

      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={MapPin}
            tooltip="Agregar sede/ubicación"
            type="button"
            onClick={() => onAddLocation(id)}
          />
          <ButtonAction
            icon={Receipt}
            tooltip="Agregar sustento"
            type="button"
            onClick={() => router(`${SUPPORTS.ROUTE_ADD}?activity_id=${id}`)}
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
