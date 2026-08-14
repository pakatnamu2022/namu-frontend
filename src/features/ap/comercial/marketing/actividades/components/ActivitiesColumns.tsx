import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MapPin, Pencil, Receipt, X } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/core/core.function";
import { ActivitiesResource } from "../lib/activities.interface";
import {
  ACTIVITIES,
  ACTIVITY_CANCELLABLE_STATUSES,
  ACTIVITY_NEXT_STATUS,
  ACTIVITY_STATUS_OPTIONS,
} from "../lib/activities.constants";
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
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [confirmNext, setConfirmNext] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [confirmCancel, setConfirmCancel] = useState(false);
      const value = row.original.status ?? "";
      const next = ACTIVITY_NEXT_STATUS[value];
      const canCancel = ACTIVITY_CANCELLABLE_STATUSES.includes(value);
      const label =
        row.original.status_label ??
        (ACTIVITY_STATUS_OPTIONS.find((s) => s.value === value)?.label as string) ??
        value;
      return (
        <div className="flex items-center gap-2">
          <Badge color={statusColor[value] ?? "secondary"} className="capitalize">
            {label}
          </Badge>
          {permissions.canUpdate && next && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => setConfirmNext(true)}
              >
                {next.label}
              </Button>
              <ConfirmationDialog
                open={confirmNext}
                onOpenChange={setConfirmNext}
                trigger={<span className="hidden" />}
                title={`¿${next.label}?`}
                description={`La actividad pasará de "${label}" a "${next.label}". ¿Confirmas este cambio de estado?`}
                confirmText="Sí, confirmar"
                cancelText="Cancelar"
                icon="info"
                onConfirm={() => onChangeStatus(row.original.id, next.value)}
              />
            </>
          )}
          {permissions.canUpdate && canCancel && (
            <>
              <ButtonAction
                icon={X}
                color="red"
                tooltip="Cancelar actividad"
                type="button"
                onClick={() => setConfirmCancel(true)}
              />
              <ConfirmationDialog
                open={confirmCancel}
                onOpenChange={setConfirmCancel}
                trigger={<span className="hidden" />}
                title="¿Cancelar actividad?"
                description="Esta acción marcará la actividad como cancelada. ¿Estás seguro de que deseas continuar?"
                confirmText="Sí, cancelar"
                cancelText="No, continuar"
                variant="destructive"
                icon="danger"
                onConfirm={() => onChangeStatus(row.original.id, "cancelled")}
              />
            </>
          )}
        </div>
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
