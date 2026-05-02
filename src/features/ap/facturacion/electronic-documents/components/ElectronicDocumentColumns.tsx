import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge, BadgeColor } from "@/components/ui/badge";
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
  ArrowRightLeft,
  BookCheck,
  BookX,
  LucideIcon,
} from "lucide-react";
import { ElectronicDocumentResource } from "../lib/electronicDocument.interface";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { AnnulDocumentDialog } from "./CancelDocumentDialog";
import ElectronicDocumentMigrationHistory from "./ElectronicDocumentMigrationHistory";
import WorkOrdersSheet from "./WorkOrdersSheet";
import { SUNAT_TYPE_INVOICES_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { AREA_COMERCIAL } from "@/features/ap/ap-master/lib/apMaster.constants";
import MigrationStatusBadge from "./MigrationStatusBadge";
import { ButtonAction } from "@/shared/components/ButtonAction";

export type ElectronicDocumentColumn = ColumnDef<ElectronicDocumentResource>;

interface Props {
  routeAbsolute: string;
  onView: (document: ElectronicDocumentResource) => void;
  onSendToSunat?: (id: number) => void;
  onAnnul?: (id: number, reason: string) => void;
  onPreCancel?: (id: number) => Promise<boolean>;
  onMigrate?: (id: number) => void;
  permissions: {
    canSend: boolean;
    canUpdate: boolean;
    canAnnul: boolean;
    canCreateCreditNote: boolean;
    canCreateDebitNote: boolean;
  };
}

export const electronicDocumentColumns = ({
  routeAbsolute: ABSOLUTE_ROUTE,
  onView,
  onSendToSunat,
  onAnnul,
  onPreCancel,
  onMigrate,
  permissions,
}: Props): ElectronicDocumentColumn[] => {
  // Determinar la ruta según el módulo

  return [
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
        const isAdvance = row.original.is_advance_payment;
        return (
          <div className="flex flex-col items-start w-fit">
            <span className="font-mono text-sm font-semibold">
              <span> {fullNumber}</span>
            </span>
            <span className="text-xs">
              {isAdvance ? "ANTICIPO" : "VENTA INTERNA"}
            </span>
          </div>
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
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        const statusConfig: Record<
          string,
          { label: string; icon: LucideIcon; color: BadgeColor }
        > = {
          draft: {
            label: "Borrador",
            icon: FileText,
            color: "gray",
          },
          sent: {
            label: "Enviado",
            icon: Send,
            color: "blue",
          },
          accepted: {
            label: "Aceptado",
            icon: CheckCircle,
            color: "green",
          },
          rejected: {
            label: "Rechazado",
            icon: XCircle,
            color: "red",
          },
          cancelled: {
            label: "Anulado",
            icon: Ban,
            color: "orange",
          },
        };

        const config =
          statusConfig[value as keyof typeof statusConfig] ||
          statusConfig.draft;
        const Icon = config.icon;

        return (
          <Badge
            variant="outline"
            className={`flex items-center gap-1 w-fit`}
            color={config.color}
            icon={Icon}
          >
            <span>{config.label}</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "aceptada_por_sunat",
      header: "Aceptado",
      cell: ({ row }) => {
        const aceptada = row.original.aceptada_por_sunat;
        const sunat_description = row.original.sunat_description;

        if (aceptada === true) {
          return (
            <Badge
              variant="outline"
              color="green"
              tooltip={sunat_description}
              icon={CheckCircle}
            >
              <span>SI</span>
            </Badge>
          );
        } else if (aceptada === false) {
          return (
            <Badge
              variant="outline"
              color="red"
              tooltip={sunat_description}
              icon={XCircle}
            >
              <span>NO</span>
            </Badge>
          );
        }

        return (
          <Badge
            variant="outline"
            className="text-muted-foreground"
            icon={Clock}
          >
            <span>Pendiente</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "migration_status",
      header: "Migración",
      cell: ({ getValue }) => {
        return <MigrationStatusBadge migration_status={getValue() as string} />;
      },
    },
    {
      accessorKey: "is_accounted",
      header: "Contabilizado",
      cell: ({ row }) => {
        const was_migrated = row.original.migration_status === "completed";
        const value = row.original.is_accounted;
        if (value === true) {
          return (
            <Badge variant="outline" color="green" icon={BookCheck}>
              <span>SI</span>
            </Badge>
          );
        }
        return (
          <Badge
            color={was_migrated ? "orange" : "gray"}
            variant="outline"
            icon={BookX}
          >
            <span>{was_migrated ? "NO" : "NO"}</span>
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
            color="red"
            tooltip={"Documento anulado en SUNAT"}
            icon={XCircle}
          >
            <span>SI</span>
          </Badge>
        ) : status === "cancelled" ? (
          <Badge
            icon={Clock}
            variant="outline"
            className="text-muted-foreground"
          >
            NO
          </Badge>
        ) : (
          <Badge
            variant="outline"
            color="green"
            tooltip={"Documento no anulado"}
            icon={CheckCircle}
          >
            <span>NO</span>
          </Badge>
        );
      },
    },

    {
      accessorKey: "is_annulled",
      header: "Anulado Dyn",
      cell: ({ getValue }) => {
        const value = getValue() as boolean | undefined;
        if (value === true) {
          return (
            <Badge variant="outline" color="red" icon={XCircle}>
              <span>Sí</span>
            </Badge>
          );
        }
        return (
          <Badge variant="outline" color="green" icon={CheckCircle}>
            <span>No</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "area_id",
      header: "Área",
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return (
          <Badge variant="outline">
            {value === AREA_COMERCIAL ? "Comercial" : "Posventa"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "sede",
      header: "Sede",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <Badge variant="outline">{value}</Badge>;
      },
    },
    {
      accessorKey: "internal_note",
      header: "Comentario",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const router = useNavigate();
        const document = row.original;

        const canMigrate =
          onMigrate &&
          document.migration_status !== "completed" &&
          document.aceptada_por_sunat; // Solo mostrar botón migrar si no está migrado completamente

        const canSendToSunat =
          document.status === "draft" && onSendToSunat && permissions.canSend;
        const canEdit = document.status === "draft" && permissions.canUpdate;
        const canAnnul =
          document.status === "accepted" &&
          document.aceptada_por_sunat &&
          !document.anulado &&
          onAnnul &&
          document.is_accounted &&
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
          document.is_accounted &&
          !document.anulado &&
          !document.is_referenced &&
          !document.credit_note_id &&
          permissions.canCreateCreditNote;

        const canViewMigrationHistory = document.migration_status !== "pending";

        const canCreateDebitNote =
          isInvoiceOrBoleta &&
          document.status === "accepted" &&
          document.aceptada_por_sunat &&
          document.is_accounted &&
          !document.anulado &&
          !document.is_referenced &&
          !document.debit_note_id &&
          !document.is_advance_payment &&
          permissions.canCreateDebitNote;

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
            <ButtonAction
              onClick={() => onView(document)}
              tooltip="Ver detalles"
              icon={Eye}
            />

            {/* Editar (solo si es borrador) */}
            <ButtonAction
              onClick={() => router(routeToEdit)}
              tooltip="Editar"
              icon={Pencil}
              canRender={canEdit}
            />

            {/* Enviar a SUNAT (solo si es borrador) */}
            <ConfirmationDialog
              title="Confirmar envío a SUNAT"
              description="¿Está seguro de que desea enviar este documento a SUNAT?"
              onConfirm={() => onSendToSunat && onSendToSunat(document.id)}
              icon="info"
              confirmText="Sí, enviar"
              cancelText="No, cancelar"
              trigger={
                <ButtonAction
                  tooltip="Enviar a SUNAT"
                  icon={Send}
                  canRender={canSendToSunat}
                  color="blue"
                />
              }
            />

            {/* Generar Nota de Crédito */}
            <ButtonAction
              tooltip="Generar Nota de Crédito"
              icon={FileMinus}
              canRender={canCreateCreditNote}
              color="blue"
              onClick={() =>
                router(`${ABSOLUTE_ROUTE}/${document.id}/credit-note`)
              }
            />

            {/* Generar Nota de Débito */}
            <ButtonAction
              tooltip="Generar Nota de Débito"
              icon={FilePlus}
              canRender={canCreateDebitNote}
              color="purple"
              onClick={() =>
                router(`${ABSOLUTE_ROUTE}/${document.id}/debit-note`)
              }
            />

            {/* Anular en Nubefact (solo si no está anulado) */}
            <AnnulDocumentDialog
              onConfirm={(reason) => onAnnul && onAnnul(document.id, reason)}
              onPreCancel={
                onPreCancel
                  ? async () => await onPreCancel(document.id)
                  : undefined
              }
              trigger={
                <ButtonAction
                  tooltip="Anular en Nubefact"
                  icon={Ban}
                  canRender={canAnnul}
                  color="orange"
                />
              }
            />

            {/* Migrar */}

            {canMigrate && (
              <ConfirmationDialog
                title="Confirmar migración"
                description="¿Está seguro de que desea migrar este documento?"
                onConfirm={() => onMigrate(document.id)}
                icon="info"
                confirmText="Sí, enviar"
                cancelText="No, cancelar"
                trigger={
                  <ButtonAction
                    tooltip="Migrar"
                    icon={ArrowRightLeft}
                    canRender={canMigrate}
                    color="indigo"
                  />
                }
              />
            )}

            {/* Work Orders */}
            {document.consolidation_type === "work_orders" && (
              <WorkOrdersSheet documentId={document.id} />
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
