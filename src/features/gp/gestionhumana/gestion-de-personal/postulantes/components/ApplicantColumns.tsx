"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ApplicantResource } from "../lib/applicant.interface.ts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { APPLICANT, APPLICANT_TYPE } from "../lib/applicant.constant.ts";

export type ApplicantColumns = ColumnDef<ApplicantResource>;

const STATUS_COLOR: Record<number, string> = {
  [APPLICANT_TYPE.POSTULANTE]: "#64748b",
  [APPLICANT_TYPE.SELECCIONADO]: "#16a34a",
  [APPLICANT_TYPE.CONTRATADO]: "#0ea5e9",
  [APPLICANT_TYPE.RECHAZADO]: "#dc2626",
  [APPLICANT_TYPE.FUERA_CUPO]: "#d97706",
  [APPLICANT_TYPE.LISTA_NEGRA]: "#111827",
};

export const applicantColumns = ({
  onStatus,
  onDelete,
}: {
  onStatus: (row: ApplicantResource) => void;
  onDelete: (id: number) => void;
}): ApplicantColumns[] => [
  {
    accessorKey: "nombre_completo",
    header: "Postulante",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold">{row.original.nombre_completo}</span>
        <span className="text-[11px] text-muted-foreground">
          DNI {row.original.vat}
          {row.original.email ? ` · ${row.original.email}` : ""}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "proceso",
    header: "Proceso",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.proceso ?? "-"}</span>
        <span className="text-[11px] text-muted-foreground">
          {row.original.sede} · {row.original.cargo}
        </span>
      </div>
    ),
  },
  {
    id: "estado_postulante",
    header: "Estado",
    cell: ({ row }) => {
      const color = STATUS_COLOR[row.original.tipo_trabajador_id] ?? "#64748b";
      return (
        <Badge
          variant="default"
          style={{
            backgroundColor: color,
            borderColor: color,
          }}
        >
          {row.original.estado_postulante}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { ROUTE_UPDATE } = APPLICANT;
      const { id, tipo_trabajador_id } = row.original;
      const editable = tipo_trabajador_id !== APPLICANT_TYPE.CONTRATADO;

      return (
        <div className="flex items-center gap-2">
          {editable && (
            <Button asChild variant="outline" size="icon" className="size-7">
              <Link to={`${ROUTE_UPDATE}/${id}`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
          )}
          {editable && (
            <ButtonAction
              icon={ShieldCheck}
              color="green"
              tooltip="Cambiar estado"
              type="button"
              onClick={() => onStatus(row.original)}
            />
          )}
          {editable && <DeleteButton onClick={() => onDelete(id)} />}
        </div>
      );
    },
  },
];
