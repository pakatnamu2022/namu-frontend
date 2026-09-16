"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { InterviewResource } from "../lib/interview.interface.ts";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { INTERVIEW_PHASE } from "../lib/interview.constant.ts";

export type InterviewColumns = ColumnDef<InterviewResource>;

export const interviewColumns = ({
  onScore,
  onDelete,
}: {
  onScore: (row: InterviewResource) => void;
  onDelete: (id: number) => void;
}): InterviewColumns[] => [
  {
    accessorKey: "postulante",
    header: "Postulante",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.postulante ?? "-"}</span>
    ),
  },
  {
    accessorKey: "fase",
    header: "Fase",
    cell: ({ row }) => (
      <Badge color={row.original.fase === INTERVIEW_PHASE.JEFE ? "blue" : "tertiary"}>
        {row.original.fase_label ?? "-"}
      </Badge>
    ),
  },
  {
    accessorKey: "entrevistador",
    header: "Entrevistador",
    cell: ({ row }) => row.original.entrevistador ?? "-",
  },
  {
    accessorKey: "fecha_entrevista",
    header: "Fecha",
    cell: ({ row }) =>
      row.original.fecha_entrevista
        ? format(row.original.fecha_entrevista, "PPP HH:mm", { locale: es })
        : "-",
  },
  {
    id: "resultado",
    header: "Resultado",
    cell: ({ row }) => {
      const promedio = row.original.resultado_promedio;
      if (promedio === null || promedio === undefined) {
        return (
          <Badge variant="outline" color="amber">
            Sin calificar
          </Badge>
        );
      }
      return (
        <Badge color={promedio >= 3 ? "green" : "red"}>
          {Number(promedio).toFixed(2)} / 5
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;
      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={Star}
            color="blue"
            tooltip="Calificar"
            type="button"
            onClick={() => onScore(row.original)}
          />
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
