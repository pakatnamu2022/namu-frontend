"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Download,
  Eye,
  Pencil,
  ShieldCheck,
  ShieldX,
  Upload,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { CustomerKycDeclarationResource } from "../lib/declaracionJuradaKyc.interface";
import { Badge } from "@/components/ui/badge";
import {
  KYC_STATUS_LABEL,
  LEGAL_REVIEW_STATUS_LABEL,
  LEGAL_REVIEW_STATUS_COLOR,
} from "../lib/declaracionJuradaKyc.constants";
import { errorToast, formatDate, successToast } from "@/core/core.function";
import { downloadCustomerKycDeclarationPdf } from "../lib/declaracionJuradaKyc.actions";
import { CopyCell } from "@/shared/components/CopyCell";
import { ButtonAction } from "@/shared/components/ButtonAction";

export type DeclaracionJuradaKycColumn =
  ColumnDef<CustomerKycDeclarationResource>;

const statusColorMap: Record<string, "yellow" | "blue" | "green" | "gray"> = {
  PENDIENTE: "yellow",
  GENERADO: "blue",
  FIRMADO: "green",
};

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onViewDetail: (item: CustomerKycDeclarationResource) => void;
  onUploadSigned: (item: CustomerKycDeclarationResource) => void;
  onConfirmLegalReview: (item: CustomerKycDeclarationResource) => void;
  onRejectLegalReview: (item: CustomerKycDeclarationResource) => void;
  onPdfDownloaded?: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
    canUploadSigned: boolean;
    canLegalReview: boolean;
  };
}

export const declaracionJuradaKycColumns = ({
  onUpdate,
  onDelete,
  onViewDetail,
  onUploadSigned,
  onConfirmLegalReview,
  onRejectLegalReview,
  onPdfDownloaded,
  permissions,
}: Props): DeclaracionJuradaKycColumn[] => [
  {
    accessorKey: "full_name",
    header: "Cliente",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? <CopyCell value={value} className="font-semibold" /> : "-";
    },
    enableSorting: false,
  },
  {
    accessorKey: "num_doc",
    header: "Documento",
    cell: ({ row }) => {
      const { num_doc, document_type } = row.original;
      return (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{document_type}</span>
          <span className="font-medium">{num_doc}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "declaration_date",
    header: "Fecha Declaración",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (!date) return "-";
      try {
        return formatDate(date);
      } catch {
        return date;
      }
    },
    enableSorting: false,
  },
  {
    accessorKey: "beneficiary_type",
    header: "Beneficiario",
    cell: ({ getValue }) => {
      const map: Record<string, string> = {
        PROPIO: "Propio",
        TERCERO_NATURAL: "Tercero Natural",
        PERSONA_JURIDICA: "Persona Jurídica",
        ENTE_JURIDICO: "Ente Jurídico",
      };
      return map[getValue() as string] ?? (getValue() as string);
    },
    enableSorting: false,
  },
  {
    accessorKey: "purchase_request_quote_id",
    header: "Cotización",
    cell: ({ getValue }) => {
      const value = getValue() as number | null;
      return value ? (
        <CopyCell value={String(value)} className="font-medium" />
      ) : (
        <Badge variant="outline" color="gray">
          Sin cotización
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge variant="outline" color={statusColorMap[status] ?? "gray"}>
          {KYC_STATUS_LABEL[status] ?? status}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "legal_review_status",
    header: "Revisión Legal",
    cell: ({ getValue }) => {
      const status = getValue() as string | null;
      if (!status) {
        return (
          <Badge variant="outline" color="gray">
            Sin revisión
          </Badge>
        );
      }
      return (
        <Badge
          variant="outline"
          color={LEGAL_REVIEW_STATUS_COLOR[status] ?? "gray"}
        >
          {LEGAL_REVIEW_STATUS_LABEL[status] ?? status}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const item = row.original;
      const { id, status, signed_file_path, legal_review_status } = item;
      const isFirmado = status === "FIRMADO";
      const isAlreadySigned = signed_file_path !== null;
      const canReview =
        permissions.canLegalReview &&
        isFirmado &&
        (!legal_review_status || legal_review_status === "PENDIENTE");

      const handleDownloadPdf = async () => {
        try {
          await downloadCustomerKycDeclarationPdf(id);
          successToast("PDF descargado correctamente");
          onPdfDownloaded?.(id);
        } catch {
          errorToast("Error al descargar el PDF");
        }
      };

      return (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Ver Detalle"
            onClick={() => onViewDetail(item)}
          >
            <Eye className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="size-7"
            color={isFirmado ? "blue" : undefined}
            tooltip="Descargar PDF"
            onClick={
              isFirmado && signed_file_path
                ? () => window.open(signed_file_path, "_blank")
                : handleDownloadPdf
            }
          >
            <Download className="size-4" />
          </Button>

          {permissions.canUploadSigned && !isFirmado && !isAlreadySigned && (
            <ButtonAction
              icon={Upload}
              variant="outline"
              color="blue"
              tooltip="Subir PDF Firmado"
              onClick={() => onUploadSigned(item)}
            />
          )}

          {canReview && (
            <>
              <Button
                variant="outline"
                size="icon"
                color="green"
                tooltip="Confirmar revisión legal"
                onClick={() => onConfirmLegalReview(item)}
              >
                <ShieldCheck className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                color="red"
                tooltip="Rechazar revisión legal"
                onClick={() => onRejectLegalReview(item)}
              >
                <ShieldX className="size-4" />
              </Button>
            </>
          )}

          {permissions.canUpdate && !isAlreadySigned && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
              onClick={() => onUpdate(id)}
            >
              <Pencil className="size-4" />
            </Button>
          )}

          {permissions.canDelete && !isAlreadySigned && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
