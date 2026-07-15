"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  DeliveryStatus,
  WashStatus,
  VehiclesDeliveryResource,
} from "../lib/vehicleDelivery.interface";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Eye,
  FileText,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Info,
  ArrowRightLeft,
  Calendar,
  ClipboardList,
  Download,
  Droplets,
  User,
  Car,
  LucideIcon,
  CalendarClock,
  Hourglass,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { VEHICLE_DELIVERY } from "../lib/vehicleDelivery.constants";
import { ButtonAction } from "@/shared/components/ButtonAction";
import ShippingGuideHistory from "@/features/ap/shipping_guides/components/ShippingGuideHistory";

export type VehicleDeliveryColumns = ColumnDef<VehiclesDeliveryResource>;

interface Props {
  onDelete: (id: number) => void;
  onSendToNubefact: (id: number) => void;
  onQueryFromNubefact: (id: number) => void;
  onSendToDynamic?: (id: number) => void;
  onViewDetails: (vehicle: VehiclesDeliveryResource) => void;
  onMigrate?: (id: number) => void;
  onSyncAccountingEntry?: (id: number) => void;
  onReschedule?: (vehicle: VehiclesDeliveryResource) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
    canView: boolean;
    canViewHistory: boolean;
    canGenerate: boolean;
    canChecklist: boolean;
    canSend: boolean;
    canMigrate: boolean;
  };
}

const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return null;
  try {
    const date = typeof value === "string" ? new Date(value) : value;
    return date;
  } catch {
    return null;
  }
};

export const vehicleDeliveryColumns = ({
  onDelete,
  onSendToNubefact,
  onQueryFromNubefact,
  onViewDetails,
  onMigrate,
  onSyncAccountingEntry,
  onReschedule,
  permissions,
}: Props): VehicleDeliveryColumns[] => [
  {
    accessorKey: "advisor_name",
    header: "Asesor / Cliente",
    cell: ({ row }) => {
      const advisor = row.original.advisor_name;
      const client = row.original.client_name;
      return (
        <div className="flex flex-col gap-0.5 min-w-[140px]">
          {advisor ? (
            <div className="flex items-center gap-1.5">
              <User className="size-3 text-muted-foreground shrink-0" />
              <span className="font-semibold text-sm leading-tight">
                {advisor}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">Sin asesor</span>
          )}
          {client && (
            <span className="text-xs text-muted-foreground pl-4 leading-tight">
              {client}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "vin",
    header: "VIN",
    cell: ({ row }) => {
      const vin = row.original.vin;
      const sede = row.original.sede_name;
      return (
        <div className="flex flex-col gap-0.5">
          {vin ? (
            <div className="flex items-center gap-1.5">
              <Car className="size-3 text-muted-foreground shrink-0" />
              <span className="font-mono text-xs font-semibold tracking-wide">
                {vin}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
          {sede && (
            <span className="text-xs text-muted-foreground pl-4">{sede}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "scheduled_delivery_date",
    header: "Entrega",
    cell: ({ getValue }) => {
      const date = formatDate(getValue() as string | Date);
      if (!date)
        return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3 text-muted-foreground shrink-0" />
            <span className="text-xs font-medium">
              {format(date, "dd/MM/yyyy", { locale: es })}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono pl-4">
            {format(date, "HH:mm", { locale: es })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "wash_date",
    header: "Lavado",
    cell: ({ getValue }) => {
      const date = formatDate(getValue() as string | Date);
      if (!date)
        return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Droplets className="size-3 text-muted-foreground shrink-0" />
            <span className="text-xs font-medium">
              {format(date, "dd/MM/yyyy", { locale: es })}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono pl-4">
            {format(date, "HH:mm", { locale: es })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status_wash",
    header: "Estado Lavado",
    cell: ({ getValue }) => {
      const value = (getValue() as WashStatus) ?? "pending";
      const config: Record<
        WashStatus,
        { label: string; color: "green" | "amber"; icon: LucideIcon }
      > = {
        pending: { label: "Pendiente", color: "amber", icon: XCircle },
        completed: { label: "Completado", color: "green", icon: CheckCircle2 },
      };
      const { label, color, icon } = config[value] ?? config.pending;
      return (
        <Badge color={color} icon={icon} className="capitalize w-fit">
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status_delivery",
    header: "Estado Entrega",
    cell: ({ getValue }) => {
      const value = (getValue() as DeliveryStatus) ?? "pending";
      const config: Record<
        DeliveryStatus,
        { label: string; color: "green" | "blue" | "amber"; icon: LucideIcon }
      > = {
        pending: { label: "Pendiente", color: "amber", icon: XCircle },
        delivered: { label: "Entregado", color: "blue", icon: ArrowRightLeft },
        completed: { label: "Completado", color: "green", icon: CheckCircle2 },
      };
      const { label, color, icon } = config[value] ?? config.pending;
      return (
        <Badge color={color} icon={icon} className="capitalize w-fit">
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_extraordinary",
    header: "Extraordinaria",
    cell: ({ row }) => {
      const { is_extraordinary, extraordinary_approved } = row.original;
      if (!is_extraordinary)
        return <span className="text-muted-foreground text-xs">—</span>;
      if (extraordinary_approved === null || extraordinary_approved === undefined) {
        return (
          <Badge color="amber" icon={Hourglass} className="w-fit">
            Pendiente de aprobación
          </Badge>
        );
      }
      if (extraordinary_approved) {
        return (
          <Badge color="green" icon={ShieldCheck} className="w-fit">
            Extraordinaria aprobada
          </Badge>
        );
      }
      return (
        <Badge color="red" icon={ShieldX} className="w-fit">
          Extraordinaria rechazada
        </Badge>
      );
    },
  },
  {
    accessorKey: "checklist_status",
    header: "Checklist",
    cell: ({ getValue }) => {
      const value = getValue() as "draft" | "confirmed" | null | undefined;
      if (!value) {
        return (
          <Badge color="gray" icon={XCircle} className="capitalize w-fit">
            Sin checklist
          </Badge>
        );
      }
      if (value === "confirmed") {
        return (
          <Badge color="green" icon={CheckCircle2} className="capitalize w-fit">
            Confirmado
          </Badge>
        );
      }
      return (
        <Badge color="blue" icon={ClipboardList} className="capitalize w-fit">
          Borrador
        </Badge>
      );
    },
  },
  {
    accessorKey: "sent_at",
    id: "sent_at",
    meta: {
      title: "Enviado SUNAT",
    },
    header: () => (
      <div className="flex items-center gap-1.5">
        <span>Enviado SUNAT</span>
        <Badge
          variant="ghost"
          tooltipVariant="muted"
          tooltip={
            <div className="space-y-2">
              <h4 className="font-semibold text-sm mb-2">Estados de SUNAT</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-green-600" />
                  <span>Aceptado por SUNAT</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary" />
                  <span>En espera de respuesta</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-destructive" />
                  <span>Rechazado (&gt;5h sin respuesta)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-gray-400" />
                  <span>No enviado</span>
                </div>
              </div>
            </div>
          }
        >
          <Info className="size-3.5 text-muted-foreground hover:text-foreground transition-colors" />
        </Badge>
      </div>
    ),
    cell: ({ row }) => {
      const sentAt = row.getValue("sent_at") as string | null;
      const aceptadaPorSunat = row.original.aceptada_por_sunat;

      if (!sentAt) {
        return (
          <Badge color="gray" icon={XCircle}>
            No enviado
          </Badge>
        );
      }

      const sentDate = new Date(sentAt);
      let color: "green" | "destructive" | "blue";
      let label: string;
      let icon: LucideIcon;

      if (aceptadaPorSunat === true) {
        color = "green";
        label = "Aceptado";
        icon = CheckCircle2;
      } else if (aceptadaPorSunat === false) {
        color = "destructive";
        label = "Rechazado";
        icon = XCircle;
      } else {
        color = "blue";
        label = "En espera";
        icon = CheckCircle2;
      }

      return (
        <div className="flex flex-col gap-1">
          <Badge icon={icon} color={color} className="w-fit">
            {label}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {format(sentDate, "dd/MM/yyyy HH:mm", { locale: es })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "observations",
    header: "Observaciones",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? (
        <span
          className="text-sm text-muted-foreground truncate max-w-[200px] block"
          title={value}
        >
          {value}
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const {
        id,
        shipping_guide_id,
        sent_at,
        aceptada_por_sunat,
        checklist_status,
        status_delivery,
        is_accounted,
      } = row.original;
      const migrationStatus = row.original.shipping_guide?.migration_status;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { ABSOLUTE_ROUTE } = VEHICLE_DELIVERY;

      const isAcceptedBySunat = !!sent_at && aceptada_por_sunat === true;
      const isChecklistConfirmed = checklist_status === "confirmed";
      const isMigrated =
        migrationStatus === "completed" ||
        migrationStatus === "updated_with_nc";

      /**
       * PERMISSIONS
       */
      const canView = permissions.canView;

      const canOpenChecklist = permissions.canChecklist;

      const canDownloadChecklistPDF =
        isChecklistConfirmed && permissions.canGenerate;

      const canGenerateGuiaRemision =
        isChecklistConfirmed &&
        (!sent_at || aceptada_por_sunat !== true) &&
        permissions.canGenerate;

      const canSendToNubefact =
        !!shipping_guide_id && !isAcceptedBySunat && permissions.canSend;

      const canQueryFromNubefact =
        !!shipping_guide_id && !isAcceptedBySunat && permissions.canSend;

      const canMigrate =
        !!onMigrate &&
        !!shipping_guide_id &&
        !isMigrated &&
        permissions.canMigrate;

      const canViewHistory =
        !!shipping_guide_id && isMigrated && permissions.canViewHistory;

      const canDelete = !shipping_guide_id && permissions.canDelete;

      const canReschedule =
        !!onReschedule &&
        status_delivery !== "completed" &&
        !shipping_guide_id &&
        permissions.canUpdate;

      return (
        <div className="flex items-center gap-2">
          {canReschedule && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Reprogramar entrega"
              onClick={() => onReschedule!(row.original)}
            >
              <CalendarClock className="size-4" />
            </Button>
          )}

          {canView && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Ver detalles"
              onClick={() => onViewDetails(row.original)}
            >
              <Eye className="size-4" />
            </Button>
          )}

          <ButtonAction
            tooltip="Checklist de Entrega"
            onClick={() => router(`${ABSOLUTE_ROUTE}/checklist/${id}`)}
            icon={ClipboardList}
            color="amber"
            variant="secondary"
            canRender={canOpenChecklist}
          />

          <ButtonAction
            tooltip="Ver PDF Checklist"
            onClick={() => router(`${ABSOLUTE_ROUTE}/checklist/${id}`)}
            icon={Download}
            color="green"
            variant="secondary"
            canRender={canDownloadChecklistPDF}
          />

          <ButtonAction
            tooltip="Guía de Remisión"
            onClick={() => router(`${ABSOLUTE_ROUTE}/guia-remision/${id}`)}
            icon={FileText}
            color="sky"
            variant="secondary"
            canRender={canGenerateGuiaRemision}
          />

          {canSendToNubefact && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Enviar a Nubefact"
              onClick={() => onSendToNubefact(id)}
            >
              <Send className="size-4" />
            </Button>
          )}

          {canQueryFromNubefact && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Consultar estado en SUNAT"
              onClick={() => onQueryFromNubefact(id)}
            >
              <RefreshCw className="size-4" />
            </Button>
          )}

          {canMigrate && (
            <Button
              variant="outline"
              size="icon"
              color="orange"
              className="size-7"
              tooltip="Migrar a Dynamics"
              onClick={() => onMigrate!(shipping_guide_id!)}
            >
              <ArrowRightLeft className="size-4" />
            </Button>
          )}

          {canViewHistory && (
            <ShippingGuideHistory shippingGuideId={shipping_guide_id!} />
          )}

          {onSyncAccountingEntry &&
            status_delivery === "completed" &&
            !is_accounted && (
              <Button
                variant="outline"
                color="violet"
                size="icon"
                className="size-7"
                tooltip="Sincronizar asiento contable"
                onClick={() => onSyncAccountingEntry(id)}
              >
                <ArrowRightLeft className="size-4" />
              </Button>
            )}

          {canDelete && <DeleteButton onClick={() => onDelete(id)} />}
        </div>
      );
    },
  },
];
