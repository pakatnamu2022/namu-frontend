import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Pencil,
  FileMinus,
  FilePlus,
} from "lucide-react";
import { ElectronicDocumentResource } from "../lib/electronicDocument.interface";
import {
  ELECTRONIC_DOCUMENT,
  ELECTRONIC_DOCUMENT_REPUESTOS,
  ELECTRONIC_DOCUMENT_TALLER,
} from "../lib/electronicDocument.constants";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { AnnulDocumentDialog } from "./CancelDocumentDialog";
import ElectronicDocumentMigrationHistory from "./ElectronicDocumentMigrationHistory";
import { SUNAT_TYPE_INVOICES_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

export type ElectronicDocumentColumn = ColumnDef<ElectronicDocumentResource>;

interface Props {
  onView: (document: ElectronicDocumentResource) => void;
  onSendToSunat?: (id: number) => void;
  onAnnul?: (id: number, reason: string) => void;
  onPreCancel?: (id: number) => Promise<void>;
  permissions: {
    canSend: boolean;
    canUpdate: boolean;
    canAnnul: boolean;
    canCreateCreditNote: boolean;
    canCreateDebitNote: boolean;
  };
  module: "COMERCIAL" | "TALLER" | "REPUESTOS";
}

export const electronicDocumentColumns = ({
  onView,
  onSendToSunat,
  onAnnul,
  onPreCancel,
  permissions,
  module,
}: Props): ElectronicDocumentColumn[] => {
  // Determinar la ruta según el módulo
  const { ABSOLUTE_ROUTE } =
    module === "COMERCIAL"
      ? ELECTRONIC_DOCUMENT
      : module === "TALLER"
      ? ELECTRONIC_DOCUMENT_TALLER
      : ELECTRONIC_DOCUMENT_REPUESTOS;

  return [
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        const statusConfig = {
          draft: {
            label: "Borrador",
            icon: FileText,
            className: "bg-gray-100 text-gray-700 border-gray-300",
          },
          sent: {
            label: "Enviado",
            icon: Send,
            className: "bg-blue-100 text-blue-700 border-blue-300",
          },
          accepted: {
            label: "Aceptado",
            icon: CheckCircle,
            className: "bg-green-100 text-green-700 border-green-300",
          },
          rejected: {
            label: "Rechazado",
            icon: XCircle,
            className: "bg-red-100 text-red-700 border-red-300",
          },
          cancelled: {
            label: "Anulado",
            icon: Ban,
            className: "bg-orange-100 text-orange-700 border-orange-300",
          },
        };

        const config =
          statusConfig[value as keyof typeof statusConfig] ||
          statusConfig.draft;
        const Icon = config.icon;

        return (
          <Badge
            variant="outline"
            className={`${config.className} flex items-center gap-1 w-fit`}
          >
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "documentType",
      header: "Tipo",
      cell: ({ row }) => {
        const documentType = row.original.document_type;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {documentType?.description || "N/A"}
            </span>
            {/* <span className="text-xs text-muted-foreground">
            {documentType?.prefix || ""}
          </span> */}
          </div>
        );
      },
    },
    {
      accessorKey: "serie",
      header: "Serie - Número",
      cell: ({ row }) => {
        const fullNumber = row.original.full_number;
        return (
          <Badge variant="outline" className="font-mono text-sm font-semibold">
            {fullNumber}
          </Badge>
        );
      },
    },
    {
      accessorKey: "cliente_denominacion",
      header: "Cliente",
      cell: ({ row }) => {
        const denominacion = row.original.cliente_denominacion;
        const documento = row.original.cliente_numero_de_documento;
        return (
          <div className="flex flex-col max-w-[250px]">
            <span className="font-medium text-sm truncate">{denominacion}</span>
            <span className="text-xs text-muted-foreground">{documento}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "fecha_de_emision",
      header: "Fecha Emisión",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <span className="text-sm">
            {new Date(value).toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "currency",
      header: "Moneda",
      cell: ({ row }) => {
        const currency = row.original.currency;
        return (
          <Badge variant="outline" className="font-semibold">
            {currency?.iso_code || "N/A"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const total = row.original.total;
        const currency = row.original.currency;
        const symbol =
          currency?.iso_code === "PEN"
            ? "S/"
            : currency?.iso_code === "USD"
            ? "$"
            : "";

        return (
          <span className="font-semibold text-sm">
            {symbol}{" "}
            {total.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      accessorKey: "aceptada_por_sunat",
      header: "SUNAT",
      cell: ({ row }) => {
        const aceptada = row.original.aceptada_por_sunat;
        const sunat_description = row.original.sunat_description;

        if (aceptada === true) {
          return (
            <Badge
              variant="outline"
              className="bg-green-100 text-green-700 border-green-300 flex items-center gap-1 w-fit"
              tooltip={sunat_description}
            >
              <CheckCircle className="h-3 w-3" />
              <span>Aceptado</span>
            </Badge>
          );
        } else if (aceptada === false) {
          return (
            <Badge
              variant="outline"
              className="bg-red-100 text-red-700 border-red-300 flex items-center gap-1 w-fit"
              tooltip={sunat_description}
            >
              <XCircle className="h-3 w-3" />
              <span>Rechazado</span>
            </Badge>
          );
        }

        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      },
    },
    {
      accessorKey: "anulado",
      header: "Anulado",
      cell: ({ row }) => {
        const anulado = row.original.anulado;
        const status = row.original.status;

        return anulado ? (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-700 border-red-300 flex items-center gap-1 w-fit"
            tooltip={"Documento anulado en SUNAT"}
          >
            <XCircle className="h-3 w-3" />
            <span>Anulado</span>
          </Badge>
        ) : status === "cancelled" ? (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 border-green-300 flex items-center gap-1 w-fit"
            tooltip={"Documento no anulado"}
          >
            <CheckCircle className="h-3 w-3" />
            <span>No Anulado</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "origin_module",
      header: "Módulo",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <Badge variant="outline">
            {value === "comercial" ? "Comercial" : "Posventa"}
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
        const document = row.original;

        const canSendToSunat =
          document.status === "draft" && onSendToSunat && permissions.canSend;
        const canEdit = document.status === "draft" && permissions.canUpdate;
        const canAnnul =
          document.status === "accepted" &&
          document.aceptada_por_sunat &&
          !document.anulado &&
          onAnnul &&
          document.migration_status === "completed" &&
          permissions.canAnnul;

        // Puede crear NC/ND si el documento está aceptado por SUNAT, no está anulado, y es factura o boleta
        const isInvoiceOrBoleta =
          document.sunat_concept_document_type_id === 29 || // Factura
          document.sunat_concept_document_type_id === 30; // Boleta

        const canCreateCreditNote =
          isInvoiceOrBoleta &&
          document.status === "accepted" &&
          document.aceptada_por_sunat &&
          // document.migrated_at &&
          // document.migration_status === "completed" &&
          !document.anulado &&
          !document.credit_note_id &&
          permissions.canCreateCreditNote;

        const canCreateDebitNote =
          isInvoiceOrBoleta &&
          document.status === "accepted" &&
          document.aceptada_por_sunat &&
          !document.anulado &&
          document.migrated_at &&
          document.migration_status === "completed" &&
          document.items?.some(
            (item) => item.anticipo_regularizacion === true
          ) &&
          permissions.canCreateDebitNote;

        const canViewMigrationHistory = document.migration_status !== "pending";

        const routeToEdit =
          document.sunat_concept_document_type_id ===
          SUNAT_TYPE_INVOICES_ID.NOTA_DEBITO
            ? `${ABSOLUTE_ROUTE}/${document.original_document_id}/debit-note/actualizar/${document.id}`
            : document.sunat_concept_document_type_id ===
              SUNAT_TYPE_INVOICES_ID.NOTA_CREDITO
            ? `${ABSOLUTE_ROUTE}/${document.original_document_id}/credit-note/actualizar/${document.id}`
            : `${ABSOLUTE_ROUTE}/actualizar/${document.id}`;

        return (
          <div className="flex items-center gap-1">
            {/* Ver detalles */}
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onView(document)}
              tooltip="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Editar (solo si es borrador) */}
            {canEdit && (
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => router(routeToEdit)}
                tooltip="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}

            {/* Enviar a SUNAT (solo si es borrador) */}
            {canSendToSunat && (
              <ConfirmationDialog
                title="Confirmar envío a SUNAT"
                description="¿Está seguro de que desea enviar este documento a SUNAT?"
                onConfirm={() => onSendToSunat(document.id)}
                icon="info"
                confirmText="Sí, enviar"
                cancelText="No, cancelar"
                trigger={
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    tooltip="Enviar a SUNAT"
                  >
                    <Send className="h-4 w-4 text-blue-500" />
                  </Button>
                }
              />
            )}

            {/* Generar Nota de Crédito */}
            {canCreateCreditNote && (
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() =>
                  router(`${ABSOLUTE_ROUTE}/${document.id}/credit-note`)
                }
                tooltip="Generar Nota de Crédito"
              >
                <FileMinus className="h-4 w-4 text-blue-600" />
              </Button>
            )}

            {/* Generar Nota de Débito */}
            {canCreateDebitNote && (
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() =>
                  router(`${ABSOLUTE_ROUTE}/${document.id}/debit-note`)
                }
                tooltip="Generar Nota de Débito"
              >
                <FilePlus className="h-4 w-4 text-purple-600" />
              </Button>
            )}

            {/* Anular en Nubefact (solo si no está anulado) */}
            {canAnnul && (
              <AnnulDocumentDialog
                onConfirm={(reason) => onAnnul(document.id, reason)}
                onPreCancel={
                  onPreCancel
                    ? async () => await onPreCancel(document.id)
                    : undefined
                }
                trigger={
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    tooltip="Anular en Nubefact"
                  >
                    <Ban className="h-4 w-4 text-orange-600" />
                  </Button>
                }
              />
            )}

            {/* Migration History */}
            {canViewMigrationHistory && (
              <ElectronicDocumentMigrationHistory
                electronicDocumentId={document.id}
              />
            )}
          </div>
        );
      },
    },
  ];
};
