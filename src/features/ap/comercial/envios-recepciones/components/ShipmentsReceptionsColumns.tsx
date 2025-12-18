import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Pencil,
  XCircle,
  Send,
  CarFront,
  ImageIcon,
  Download,
  Info,
  Loader2,
  RefreshCw,
  PackageCheck,
  Eye,
  Ban,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import type { ShipmentsReceptionsResource } from "../lib/shipmentsReceptions.interface";
import { SHIPMENTS_RECEPTIONS } from "../lib/shipmentsReceptions.constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ShippingGuideHistory from "./ShippingGuideHistory";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SUNAT_CONCEPTS_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

export type ShipmentsReceptionsColumns = ColumnDef<ShipmentsReceptionsResource>;

interface Props {
  onDelete: (id: number) => void;
  onSendToNubefact: (id: number) => void;
  onQueryFromNubefact: (id: number) => void;
  onMarkAsReceived: (id: number) => void;
  onViewDetails: (shipment: ShipmentsReceptionsResource) => void;
  onCancel: (id: number) => void;
  permissions: {
    canSend: boolean;
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

export const shipmentsReceptionsColumns = ({
  onDelete,
  onSendToNubefact,
  onQueryFromNubefact,
  onMarkAsReceived,
  onViewDetails,
  onCancel,
  permissions,
}: Props): ShipmentsReceptionsColumns[] => [
  {
    accessorKey: "document_type",
    header: "Tipo Doc.",
    cell: ({ row }) => {
      const type = row.getValue("document_type") as string;
      return (
        <Badge variant={type === "GUIA_REMISION" ? "default" : "secondary"}>
          {type === "GUIA_REMISION" ? "Guía Remisión" : "Guía Traslado"}
        </Badge>
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
        <span className="block max-w-[200px] truncate" title={reason}>
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
    accessorKey: "document_number",
    header: "Número Doc.",
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
    accessorKey: "requires_sunat",
    header: "Req. SUNAT",
    cell: ({ row }) => {
      const requires = row.getValue("requires_sunat") as boolean;
      return requires ? (
        <CheckCircle2 className="size-5 text-green-600" />
      ) : (
        <XCircle className="size-5 text-gray-400" />
      );
    },
  },
  {
    accessorKey: "file_url",
    header: "Archivo",
    cell: ({ row }) => {
      const fileUrl = row.getValue("file_url") as string | null;

      if (!fileUrl) {
        return (
          <div
            className={`inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium border transition-colors`}
          >
            <XCircle className="size-3" />
            <span>Sin archivo</span>
          </div>
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
        <Badge variant="green">
          <CheckCircle2 className="size-3" />
          Recepcionado
        </Badge>
      ) : (
        <Badge variant="blue">
          <XCircle className="size-3" />
          Pendiente
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

      if (sentAt) {
        const sentDate = new Date(sentAt);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60);

        // Determinar estado y variante
        let variant: "green" | "destructive" | "blue";
        let label: string;
        let icon: React.ReactNode;

        if (aceptadaPorSunat === true) {
          variant = "green";
          label = "Aceptado";
          icon = <CheckCircle2 className="size-3" />;
        } else if (
          aceptadaPorSunat === false &&
          hoursDiff > WAITING_TIME_HOURS
        ) {
          variant = "destructive";
          label = "Rechazado";
          icon = <XCircle className="size-3" />;
        } else {
          variant = "blue";
          label = "En espera";
          icon = <CheckCircle2 className="size-3" />;
        }

        return (
          <div className="flex flex-col gap-1">
            <Badge variant={variant}>
              {icon}
              {label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {format(sentDate, "dd/MM/yyyy HH:mm", { locale: es })}
            </span>
          </div>
        );
      }

      return (
        <Badge variant="gray">
          <XCircle className="size-3" />
          No enviado
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
          variant={status ? "default" : "secondary"}
          className="capitalize w-20 flex items-center justify-center"
        >
          {status ? "Activo" : "Cancelado"}
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
      const {
        id,
        sent_at,
        aceptada_por_sunat,
        is_received,
        document_type,
        transfer_reason_id,
        status,
      } = row.original;
      const { ROUTE_UPDATE, ABSOLUTE_ROUTE } = SHIPMENTS_RECEPTIONS;
      const isSent = !!sent_at;
      const isGuiaRemision = document_type === "GUIA_REMISION";
      const isPurchase =
        transfer_reason_id.toString() ===
        SUNAT_CONCEPTS_ID.TRANSFER_REASON_COMPRA;
      const isTrasladoSede =
        transfer_reason_id.toString() ===
        SUNAT_CONCEPTS_ID.TRANSFER_REASON_TRASLADO_SEDE;
      const isAlreadyReceived = !!is_received;
      const notAcceptedBySunat = aceptada_por_sunat !== true;

      // Para GUIA_REMISION: requiere que esté aceptada por SUNAT y NO estar recibido
      // Para GUIA_TRASLADO con motivo COMPRA: NO estar recibido
      const canReceive = isGuiaRemision
        ? aceptada_por_sunat === true && !isAlreadyReceived
        : isPurchase && !isAlreadyReceived;

      // Tooltip dinámico para recepcionar
      const receiveTooltip = isAlreadyReceived
        ? "Ya ha sido recepcionado"
        : isGuiaRemision && notAcceptedBySunat
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

          {/* Historial - Solo para GUIA_REMISION */}
          {isGuiaRemision && <ShippingGuideHistory shippingGuideId={id} />}

          {/* Enviar a Nubefact - Solo para GUIA_REMISION y si no ha sido enviado */}
          {isGuiaRemision && !isSent && (
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

          {/* Consultar estado en Nubefact - Solo para GUIA_REMISION, si ya fue enviado y no está aceptado */}
          {isGuiaRemision && isSent && aceptada_por_sunat !== true && (
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

          {/* Marcar como Recibido - Solo para TRASLADO ENTRE SEDES (ID: 21) después de ser aceptado por SUNAT */}
          {isTrasladoSede && aceptada_por_sunat === true && (
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

          {/* Checklist de Recepción - Solo para COMPRA */}
          {isPurchase && (
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

          {/* Edit - Oculto si: (GUIA_REMISION y enviado) o (NO es GUIA_REMISION y recepcionado) */}
          {permissions.canUpdate &&
            (isGuiaRemision ? !isSent : !isAlreadyReceived) && (
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

          {/* Delete - Oculto si: (GUIA_REMISION y enviado) o (NO es GUIA_REMISION y recepcionado) */}
          {permissions.canDelete &&
            (isGuiaRemision ? !isSent : !isAlreadyReceived) && (
              <DeleteButton onClick={() => onDelete(id)} />
            )}

          {/* Cancelar guía - Solo para GUIA_REMISION, cuando ya fue recepcionado y está ACTIVO */}
          {isGuiaRemision && isAlreadyReceived && status && (
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
