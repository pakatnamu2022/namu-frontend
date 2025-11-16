"use client";

import { ColumnDef } from "@tanstack/react-table";
import { VehiclesDeliveryResource } from "../lib/vehicleDelivery.interface";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
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
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { VEHICLE_DELIVERY } from "../lib/vehicleDelivery.constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ShippingGuideHistory from "../../envios-recepciones/components/ShippingGuideHistory";

export type VehicleDeliveryColumns = ColumnDef<VehiclesDeliveryResource>;

interface Props {
  onDelete: (id: number) => void;
  onSendToNubefact: (id: number) => void;
  onQueryFromNubefact: (id: number) => void;
  onSendToDynamic: (id: number) => void;
  onViewDetails: (vehicle: VehiclesDeliveryResource) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
    canView: boolean;
  };
}

export const vehicleDeliveryColumns = ({
  onDelete,
  onSendToNubefact,
  onQueryFromNubefact,
  onSendToDynamic,
  onViewDetails,
  permissions,
}: Props): VehicleDeliveryColumns[] => [
  {
    accessorKey: "advisor_name",
    header: "Asesor",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "vin",
    header: "VIN",
  },
  {
    accessorKey: "scheduled_delivery_date",
    header: "Fecha Entrega Programada",
    cell: ({ getValue }) => {
      const value = getValue() as string | Date;
      if (!value) return "-";
      try {
        const date = typeof value === "string" ? new Date(value) : value;
        return format(date, "dd/MM/yyyy", { locale: es });
      } catch {
        return "-";
      }
    },
  },
  {
    accessorKey: "wash_date",
    header: "Fecha Lavado",
    cell: ({ getValue }) => {
      const value = getValue() as string | Date;
      if (!value) return "-";
      try {
        const date = typeof value === "string" ? new Date(value) : value;
        return format(date, "dd/MM/yyyy", { locale: es });
      } catch {
        return "-";
      }
    },
  },
  {
    accessorKey: "status_wash",
    header: "Estado Lavado",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Badge
          variant={value == "Completado" ? "default" : "secondary"}
          className="capitalize w-24 flex items-center justify-center"
        >
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status_delivery",
    header: "Estado Entrega",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Badge
          variant={value == "Completado" ? "default" : "secondary"}
          className="capitalize w-24 flex items-center justify-center"
        >
          {value}
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
        <Popover>
          <PopoverTrigger asChild>
            <button className="focus:outline-none">
              <Info className="size-3.5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
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
          </PopoverContent>
        </Popover>
      </div>
    ),
    cell: ({ row }) => {
      const sentAt = row.getValue("sent_at") as string | null;
      const aceptadaPorSunat = row.original.aceptada_por_sunat;
      const WAITING_TIME_HOURS = 5;

      // Configuración de estados con estilos modernos
      const statusConfig = {
        accepted: {
          label: "Aceptado",
          icon: <CheckCircle2 className="size-3" />,
          className:
            "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300",
        },
        rejected: {
          label: "Rechazado",
          icon: <XCircle className="size-3" />,
          className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-300",
        },
        pending: {
          label: "En espera",
          icon: <CheckCircle2 className="size-3" />,
          className:
            "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300",
        },
        notSent: {
          label: "No enviado",
          icon: <XCircle className="size-3" />,
          className:
            "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300",
        },
      };

      if (sentAt) {
        const sentDate = new Date(sentAt);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60);

        // Determinar estado
        let status: keyof typeof statusConfig;

        if (aceptadaPorSunat === true) {
          status = "accepted";
        } else if (
          aceptadaPorSunat === false &&
          hoursDiff > WAITING_TIME_HOURS
        ) {
          status = "rejected";
        } else {
          status = "pending";
        }

        const config = statusConfig[status];

        return (
          <div className="flex flex-col gap-1">
            <div
              className={`inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${config.className}`}
            >
              {config.icon}
              <span>{config.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(sentDate, "dd/MM/yyyy HH:mm", { locale: es })}
            </span>
          </div>
        );
      }

      const config = statusConfig.notSent;
      return (
        <div
          className={`inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${config.className}`}
        >
          {config.icon}
          <span>{config.label}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "observations",
    header: "Observaciones",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <p className="max-w-xs truncate" title={value}>
          {value}
        </p>
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
        status_dynamic,
      } = row.original;
      const router = useRouter();
      const { ROUTE } = VEHICLE_DELIVERY;

      // Verificar si fue enviado y aceptado por SUNAT
      const isAcceptedBySunat = sent_at && aceptada_por_sunat === true;

      return (
        <div className="flex items-center gap-2">
          {/* Ver detalles */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Ver detalles"
            onClick={() => onViewDetails(row.original)}
          >
            <Eye className="size-4" />
          </Button>

          {/* Historial - Solo para GUIA_REMISION */}
          {isAcceptedBySunat && shipping_guide_id && (
            <ShippingGuideHistory shippingGuideId={shipping_guide_id} />
          )}

          {/* Guía de Remisión */}
          {!sent_at && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Guía de Remisión"
              onClick={() => router.push(`${ROUTE}/guia-remision/${id}`)}
            >
              <FileText className="size-4" />
            </Button>
          )}

          {/* Enviar a Nubefact - Solo si hay guía generada y NO ha sido aceptado por SUNAT */}
          {shipping_guide_id && !isAcceptedBySunat && (
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

          {/* Consultar estado en Nubefact - Solo si hay guía generada y NO ha sido aceptado por SUNAT */}
          {shipping_guide_id && !isAcceptedBySunat && (
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

          {/* Enviar a Dynamic - Solo si fue aceptado por SUNAT */}
          {isAcceptedBySunat && !status_dynamic && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Enviar a Dynamic"
              onClick={() => onSendToDynamic(id)}
            >
              <Database className="size-4" />
            </Button>
          )}

          {/* Delete - Ocultar si ya se generó la guía de remisión */}
          {permissions.canDelete && !shipping_guide_id && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
