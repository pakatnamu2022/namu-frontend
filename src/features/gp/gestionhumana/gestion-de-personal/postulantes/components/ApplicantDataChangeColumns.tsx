"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ApplicantDataChangeResource } from "../lib/applicantDataChange.interface.ts";
import { Check, X } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";

export type ApplicantDataChangeColumns = ColumnDef<ApplicantDataChangeResource>;

export const applicantDataChangeColumns = ({
  onApprove,
  onReject,
}: {
  onApprove: (row: ApplicantDataChangeResource) => void;
  onReject: (row: ApplicantDataChangeResource) => void;
}): ApplicantDataChangeColumns[] => [
  {
    id: "postulante",
    header: "Postulante",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold">
          {row.original.applicant?.nombre_completo ?? "-"}
        </span>
        <span className="text-[11px] text-muted-foreground">
          DNI {row.original.applicant?.vat ?? "-"}
        </span>
      </div>
    ),
  },
  {
    id: "cambios",
    header: "Cambios propuestos",
    cell: ({ row }) => {
      const r = row.original;
      const fields: [string, string | null | undefined][] = [
        ["Nombre", r.nombre_completo],
        ["Email", r.email],
        ["Celular", r.cel_personal],
        ["Dirección", r.direccion_principal],
        ["Estado civil", r.estado_civil],
      ];
      const present = fields.filter(([, v]) => !!v);
      return (
        <div className="flex flex-col gap-0.5 max-w-xs">
          {present.length === 0 && (
            <span className="text-[11px] text-muted-foreground">
              Sin cambios de texto (revisar CV/foto)
            </span>
          )}
          {present.map(([label, value]) => (
            <span key={label} className="text-[11px] truncate">
              <span className="text-muted-foreground">{label}:</span> {value}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Enviado",
    cell: ({ row }) =>
      row.original.created_at
        ? new Date(row.original.created_at).toLocaleDateString("es-PE")
        : "-",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ButtonAction
          icon={Check}
          color="green"
          tooltip="Aprobar cambios"
          type="button"
          onClick={() => onApprove(row.original)}
        />
        <ButtonAction
          icon={X}
          color="red"
          tooltip="Rechazar cambios"
          type="button"
          onClick={() => onReject(row.original)}
        />
      </div>
    ),
  },
];
