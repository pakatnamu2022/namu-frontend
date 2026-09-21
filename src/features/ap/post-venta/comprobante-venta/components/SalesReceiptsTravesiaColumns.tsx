import type { ColumnDef } from "@tanstack/react-table";
import { Badge, BadgeColor } from "@/components/ui/badge";
import {
  FileText,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  LucideIcon,
  ShoppingCart,
  Undo2,
} from "lucide-react";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import ElectronicDocumentTraverseHistory from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentTraverseHistory";
import ElectronicDocumentTraverseDynamicsPreview from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentTraverseDynamicsPreview";
import { SUNAT_TYPE_INVOICES_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { CopyCell } from "@/shared/components/CopyCell";

export type SalesReceiptsTravesiaColumn = ColumnDef<ElectronicDocumentResource>;

interface Props {
  onView: (document: ElectronicDocumentResource) => void;
  onAssociatePurchase?: (document: ElectronicDocumentResource) => void;
  onRevertPurchase?: (document: ElectronicDocumentResource) => void;
  permissions: {
    canLinkCrossingPurchase: boolean;
    canUnlinkCrossingPurchase: boolean;
  };
}

export const salesReceiptsTravesiaColumns = ({
  onView,
  onAssociatePurchase,
  onRevertPurchase,
  permissions,
}: Props): SalesReceiptsTravesiaColumn[] => {
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
        const sunatDocumentTypeId = row.original.sunat_concept_document_type_id;

        const documentTypeLabel: Record<number, string> = {
          [SUNAT_TYPE_INVOICES_ID.FACTURA]: "Factura",
          [SUNAT_TYPE_INVOICES_ID.BOLETA]: "Boleta",
          [SUNAT_TYPE_INVOICES_ID.NOTA_CREDITO]: "N. Crédito",
          [SUNAT_TYPE_INVOICES_ID.NOTA_DEBITO]: "N. Débito",
        };
        const typeLabel = sunatDocumentTypeId
          ? documentTypeLabel[sunatDocumentTypeId]
          : undefined;

        return (
          <div className="flex flex-col items-start w-fit gap-0.5">
            <CopyCell size="sm" font="mono" value={fullNumber} />
            <span className="text-xs text-muted-foreground">
              {typeLabel}
              {isAdvance && (
                <span className="text-amber-600 dark:text-amber-500">
                  {typeLabel ? " · Anticipo" : "Anticipo"}
                </span>
              )}
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
      accessorKey: "related_document_number",
      header: "Doc. Relacionado",
      cell: ({ row }) => {
        const number = row.original.related_document_number;
        const type = row.original.related_document_type;

        if (!number || !type) {
          return <span className="text-xs text-muted-foreground">-</span>;
        }

        return (
          <div className="flex flex-col gap-1">
            <CopyCell size="sm" font="mono" value={number} />
            <Badge
              variant="outline"
              color={type === "Cotización" ? "blue" : "orange"}
            >
              {type}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "associate_purchase_traverse",
      header: "Compra Asociada",
      cell: ({ getValue }) => {
        const value = getValue() as boolean;
        return value ? (
          <Badge variant="outline" color="green" icon={CheckCircle}>
            <span>Sí</span>
          </Badge>
        ) : (
          <Badge variant="outline" color="gray" icon={XCircle}>
            <span>No</span>
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const document = row.original;

        const canAssociatePurchase =
          !!onAssociatePurchase &&
          permissions.canLinkCrossingPurchase &&
          !document.associate_purchase_traverse;

        const canRevertPurchase =
          !!onRevertPurchase &&
          permissions.canUnlinkCrossingPurchase &&
          !!document.associate_purchase_traverse;

        const canViewMigrationHistory = document.migration_status !== "pending";

        return (
          <div className="flex items-center gap-1">
            {/* Ver detalles */}
            <ButtonAction
              onClick={() => onView(document)}
              tooltip="Ver detalles"
              icon={Eye}
            />

            {/* Asociar Compra (travesía) */}
            <ButtonAction
              tooltip="Asociar Compra"
              icon={ShoppingCart}
              canRender={canAssociatePurchase}
              onClick={() =>
                onAssociatePurchase && onAssociatePurchase(document)
              }
            />

            {/* Revertir Compra (travesía) */}
            <ConfirmationDialog
              title="Confirmar reversión"
              description="¿Está seguro de que desea revertir la asociación de compra de este documento?"
              onConfirm={() => onRevertPurchase && onRevertPurchase(document)}
              icon="warning"
              confirmText="Sí, revertir"
              cancelText="No, cancelar"
              trigger={
                <ButtonAction
                  tooltip="Desasociar Compra"
                  icon={Undo2}
                  canRender={canRevertPurchase}
                  color="red"
                />
              }
            />

            {/* Migration History */}
            {canViewMigrationHistory && (
              <ElectronicDocumentTraverseHistory
                electronicDocumentId={document.id}
              />
            )}

            {/* Preview payload Dynamics (Travesía) */}
            <ElectronicDocumentTraverseDynamicsPreview
              documentId={document.id}
            />
          </div>
        );
      },
    },
  ];
};
