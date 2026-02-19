import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Pencil,
  XCircle,
  CarFront,
  ImageIcon,
  Download,
  Eye,
  Ban,
  PackageCheck,
  Loader2,
  Info,
  Send,
  RefreshCw,
  Database,
  ShoppingCart,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import type { ControlUnitsResource } from "../lib/controlUnits.interface";
import { CONTROL_UNITS } from "../lib/controlUnits.constants";
import { VEHICLE_PURCHASE_ORDER } from "../../ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import { SUNAT_CONCEPTS_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ShippingGuideHistory from "@/features/ap/comercial/envios-recepciones/components/ShippingGuideHistory";

export type ControlUnitsColumns = ColumnDef<ControlUnitsResource>;

interface Props {
  onDelete: (id: number) => void;
  onMarkAsReceived: (id: number) => void;
  onViewDetails: (shipment: ControlUnitsResource) => void;
  onCancel: (id: number) => void;
  onSendToNubefact: (id: number) => void;
  onQueryFromNubefact: (id: number) => void;
  onSendToDynamic: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

// Componente para manejar la carga de imagen
// eslint-disable-next-line react-refresh/only-export-components
const ImagePreview = ({ fileUrl }: { fileUrl: string }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = () => {
    // Extraer el nombre del archivo de la URL
    const fileName =
      fileUrl.split("/").pop() || `guia-remision-${Date.now()}.png`;

    // Crear un link temporal y simular click
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex justify-center mb-4 mt-2">
        <Button
          variant="default"
          size="sm"
          className="gap-2"
          onClick={handleDownload}
        >
          <Download className="size-4" />
          Descargar imagen
        </Button>
      </div>
      <div className="relative w-full h-[600px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Cargando imagen...
              </p>
            </div>
          </div>
        )}
        <img
          src={fileUrl}
          alt="Guía de remisión"
          className="w-full h-full object-contain"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </>
  );
};

export const ControlUnitsColumns = ({
  onDelete,
  onMarkAsReceived,
  onViewDetails,
  onCancel,
  onSendToNubefact,
  onQueryFromNubefact,
  onSendToDynamic,
  permissions,
}: Props): ControlUnitsColumns[] => [
  {
    accessorKey: "document_number",
    header: "Número Doc.",
    cell: ({ row }) => {
      const number = row.getValue("document_number") as string;
      const type = row.getValue("document_type") as string;
      return (
        <div className="flex flex-col items-start w-fit">
          <span className="font-mono text-sm font-semibold">
            <span> {number}</span>
          </span>
          <span className="text-xs">
            {type === "GUIA_REMISION" ? "Guía Remisión" : "Guía Traslado"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "document_type",
    header: "Tipo Doc.",
    cell: ({ row }) => {
      const type = row.getValue("document_type") as string;
      const isConsignment = !!row.original.is_consignment;
      return (
        <div className="flex flex-col gap-1">
          <Badge color={type === "GUIA_REMISION" ? "default" : "secondary"}>
            {type === "GUIA_REMISION" ? "Guía Remisión" : "Guía Traslado"}
          </Badge>
          {isConsignment && <Badge color="purple">Consignación</Badge>}
        </div>
      );
    },
  },
  {
    accessorKey: "dates",
    header: "Fechas",
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string;
      const issueDate = row.getValue("issue_date") as string;
      return (
        <div className="flex flex-col gap-1 text-xs">
          <div>
            <span className="font-semibold">Emisión: </span>
            {createdAt
              ? format(new Date(createdAt), "dd/MM/yyyy", { locale: es })
              : "-"}
          </div>
          <div>
            <span className="font-semibold">Traslado: </span>
            {issueDate
              ? format(new Date(issueDate), "dd/MM/yyyy", { locale: es })
              : "-"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha Emisión",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "-";
    },
  },
  {
    accessorKey: "issue_date",
    header: "Fecha Translado",
    cell: ({ row }) => {
      const date = row.getValue("issue_date") as string;
      return date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "-";
    },
  },
  {
    accessorKey: "transfer_reason_description",
    header: "Motivo de traslado",
    cell: ({ row }) => {
      const reason = row.getValue("transfer_reason_description") as string;
      return (
        <span className="text-sm" title={reason}>
          {reason}
        </span>
      );
    },
  },
  {
    accessorKey: "document_series",
    header: "Serie",
  },
  {
    accessorKey: "issuer_type",
    header: "Tipo Emisor",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("issuer_type")}</Badge>
    ),
  },
  {
    accessorKey: "plate",
    header: "Placa",
  },
  {
    accessorKey: "driver_name",
    header: "Conductor",
  },
  {
    accessorKey: "license",
    header: "Licencia",
  },
  {
    accessorKey: "file_url",
    header: "Archivo",
    cell: ({ row }) => {
      const fileUrl = row.getValue("file_url") as string | null;

      if (!fileUrl) {
        return (
          <Badge color="muted" icon={XCircle}>
            Sin archivo
          </Badge>
        );
      }

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-8">
              <ImageIcon className="size-4" />
              Ver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full">
            <VisuallyHidden>
              <DialogTitle>Guía de remisión</DialogTitle>
            </VisuallyHidden>
            <ImagePreview fileUrl={fileUrl} />
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: "is_received",
    header: "Recepción",
    cell: ({ row }) => {
      const isReceived = row.getValue("is_received") as boolean;

      return isReceived ? (
        <Badge color="green" icon={CheckCircle2}>
          Recepcionado
        </Badge>
      ) : (
        <Badge color="blue" icon={XCircle}>
          Pendiente
        </Badge>
      );
    },
  },
  {
    accessorKey: "notes",
    header: "Nota Guía",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string;
      return notes ? (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {notes}
        </span>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "note_received",
    header: "Nota Recepción",
    cell: ({ row }) => {
      const notes = row.getValue("note_received") as string;
      return notes ? (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {notes}
        </span>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "cancellation_reason",
    header: "Motivo Anulación",
    cell: ({ row }) => {
      const notes = row.getValue("cancellation_reason") as string;
      return notes ? (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {notes}
        </span>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as boolean;
      return (
        <Badge
          color={status ? "default" : "secondary"}
          className="capitalize w-20 flex items-center justify-center"
        >
          {status ? "Activo" : "Cancelado"}
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
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const {
        id,
        is_received,
        transfer_reason_id,
        status,
        sent_at,
        aceptada_por_sunat,
        status_dynamic,
        requires_sunat,
      } = row.original;
      const isConsignment = !!row.original.is_consignment;
      const { ROUTE_UPDATE, ABSOLUTE_ROUTE } = CONTROL_UNITS;
      const isPurchase =
        transfer_reason_id.toString() ===
        SUNAT_CONCEPTS_ID.TRANSFER_REASON_COMPRA;
      const isTrasladoSede =
        transfer_reason_id.toString() ===
        SUNAT_CONCEPTS_ID.TRANSFER_REASON_TRASLADO_SEDE;
      const isAlreadyReceived = !!is_received;
      const isAcceptedBySunat = !!(sent_at && aceptada_por_sunat === true);

      // Para COMPRA o CONSIGNACIÓN: aceptada por SUNAT y NO estar recibido
      const canReceive =
        (isPurchase || isConsignment) && isAcceptedBySunat && !isAlreadyReceived;

      // Tooltip dinámico para recepcionar
      const receiveTooltip = isAlreadyReceived
        ? "Ya ha sido recepcionado"
        : !isAcceptedBySunat
          ? "Debe ser aceptado por SUNAT primero"
          : "Recepcionar";

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

          {/* Historial - Solo cuando fue aceptada por SUNAT */}
          {isAcceptedBySunat && (
            <ShippingGuideHistory shippingGuideId={id} />
          )}

          {/* Enviar a Nubefact - Solo si requiere SUNAT y aún no fue enviado */}
          {requires_sunat && !sent_at && (
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

          {/* Consultar estado en SUNAT - Si fue enviado pero no aceptado */}
          {requires_sunat && sent_at && !isAcceptedBySunat && (
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

          {/* Marcar como Recibido - Solo para TRASLADO ENTRE SEDES */}
          {isTrasladoSede && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip={
                isAlreadyReceived
                  ? "Ya ha sido recepcionado"
                  : "Marcar como recibido"
              }
              onClick={() => !isAlreadyReceived && onMarkAsReceived(id)}
              disabled={isAlreadyReceived}
            >
              <PackageCheck className="size-4" />
            </Button>
          )}

          {/* Checklist de Recepción - Para COMPRA o CONSIGNACIÓN, solo si aceptada por SUNAT */}
          {(isPurchase || isConsignment) && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip={receiveTooltip}
              onClick={() =>
                canReceive && router(`${ABSOLUTE_ROUTE}/checklist/${id}`)
              }
              disabled={!canReceive}
            >
              <CarFront className="size-4" />
            </Button>
          )}

          {/* Generar OC de Consignación */}
          {isConsignment && isAcceptedBySunat && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Generar Orden de Compra de Consignación"
              onClick={() =>
                router(
                  `${VEHICLE_PURCHASE_ORDER.ROUTE_ADD}?consignment_id=${id}`,
                )
              }
            >
              <ShoppingCart className="size-4" />
            </Button>
          )}

          {/* Edit */}
          {permissions.canUpdate && !isAlreadyReceived && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
              onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
            >
              <Pencil className="size-4" />
            </Button>
          )}

          {/* Delete - Oculto si ya está recepcionado */}
          {permissions.canDelete && !isAlreadyReceived && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}

          {/* Cancelar guía - Solo cuando ya fue recepcionado y está ACTIVO */}
          {isAlreadyReceived && status && (
            <Button
              variant="outline"
              size="icon"
              className="size-7 text-secondary hover:text-secondary hover:bg-red-50"
              tooltip="Cancelar guía"
              onClick={() => onCancel(id)}
            >
              <Ban className="size-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
