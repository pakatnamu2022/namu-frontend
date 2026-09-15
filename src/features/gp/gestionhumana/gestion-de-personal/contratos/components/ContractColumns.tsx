"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ContractResource } from "../lib/contract.interface.ts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, FileSearch, Send, DownloadCloud, Stamp } from "lucide-react";
import { Link } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { CONTRACT } from "../lib/contract.constant.ts";
import { formatDate, formatMoney } from "@/core/core.function.ts";

export type ContractColumns = ColumnDef<ContractResource>;

function contractStatus(contract: ContractResource): { label: string; color: string } {
  if (contract.conformidad_lectura) return { label: "Confirmado por trabajador", color: "#16a34a" };
  if (contract.estado_envio_email) return { label: "Enviado al trabajador", color: "#2563eb" };
  if (contract.confirmacion_firmante) return { label: "Firmado", color: "#2563eb" };
  if (contract.conformidad_rrhh) return { label: "Pendiente de firma", color: "#d97706" };
  if (contract.solicitar_firma) return { label: "Pendiente de aprobación RRHH", color: "#d97706" };
  return { label: "Sin iniciar firma", color: "#6b7280" };
}

export const contractColumns = ({
  onDelete,
  onViewPdf,
  onRequestApproval,
  onSendToWorker,
  onDownloadSigned,
}: {
  onDelete: (id: number) => void;
  onViewPdf: (id: number) => void;
  onRequestApproval: (id: number) => void;
  onSendToWorker: (id: number) => void;
  onDownloadSigned: (id: number) => void;
}): ContractColumns[] => [
  {
    accessorKey: "trabajador",
    header: "Trabajador",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold">{row.original.trabajador}</span>
        <span className="text-[11px] text-muted-foreground">
          {row.original.sede} · {row.original.cargo}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "tipo_contrato",
    header: "Tipo",
  },
  {
    accessorKey: "sueldo",
    header: "Sueldo",
    cell: ({ row }) => formatMoney(row.original.sueldo),
  },
  {
    accessorKey: "fecha_inicio_contrato",
    header: "Inicio",
    cell: ({ row }) => formatDate(row.original.fecha_inicio_contrato),
  },
  {
    accessorKey: "fecha_fin_contrato",
    header: "Fin",
    cell: ({ row }) => formatDate(row.original.fecha_fin_contrato),
  },
  {
    id: "status",
    header: "Estado de firma",
    cell: ({ row }) => {
      const status = contractStatus(row.original);
      return (
        <Badge
          variant="outline"
          style={{
            backgroundColor: `${status.color}20`,
            color: status.color,
            borderColor: status.color,
          }}
        >
          {status.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { ROUTE_UPDATE } = CONTRACT;
      const { id, solicitar_firma, confirmacion_firmante, estado_envio_email } =
        row.original;

      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={FileSearch}
            color="blue"
            tooltip="Ver PDF sin firma"
            type="button"
            onClick={() => onViewPdf(id)}
          />
          <Button asChild variant="outline" size="icon" className="size-7">
            <Link to={`${ROUTE_UPDATE}/${id}`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          {!solicitar_firma && (
            <ButtonAction
              icon={Stamp}
              color="amber"
              tooltip="Solicitar aprobación de firma"
              type="button"
              onClick={() => onRequestApproval(id)}
            />
          )}
          {confirmacion_firmante && !estado_envio_email && (
            <ButtonAction
              icon={Send}
              color="green"
              tooltip="Enviar contrato firmado al trabajador"
              type="button"
              onClick={() => onSendToWorker(id)}
            />
          )}
          {confirmacion_firmante && (
            <ButtonAction
              icon={DownloadCloud}
              color="blue"
              tooltip="Descargar contrato firmado"
              type="button"
              onClick={() => onDownloadSigned(id)}
            />
          )}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
