"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { RecruitmentProcessResource } from "../lib/recruitmentProcess.interface.ts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { RECRUITMENT_PROCESS } from "../lib/recruitmentProcess.constant.ts";

export type RecruitmentProcessColumns = ColumnDef<RecruitmentProcessResource>;

export const recruitmentProcessColumns = ({
  onClose,
  onDelete,
}: {
  onClose: (id: number) => void;
  onDelete: (id: number) => void;
}): RecruitmentProcessColumns[] => [
  {
    accessorKey: "nombre_postulacion",
    header: "Postulación",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold">
          {row.original.nombre_postulacion}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {row.original.sede} · {row.original.area}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "cargo",
    header: "Cargo",
  },
  {
    accessorKey: "cant_trab_solicita",
    header: "Vacantes",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">{row.original.applicants_count ?? 0}</span>
        <span className="text-muted-foreground">
          / {row.original.cant_trab_solicita}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "fecha_inicio",
    header: "Inicio",
  },
  {
    accessorKey: "fecha_fin_plazo",
    header: "Fin de plazo",
    cell: ({ row }) => row.original.fecha_fin_plazo ?? "-",
  },
  {
    id: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant="outline"
          style={
            status?.color
              ? {
                  backgroundColor: `${status.color}20`,
                  color: status.color,
                  borderColor: status.color,
                }
              : undefined
          }
        >
          {status?.estado ?? "-"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { ROUTE_UPDATE } = RECRUITMENT_PROCESS;
      const { id, is_open } = row.original;

      return (
        <div className="flex items-center gap-2">
          {is_open && (
            <Button asChild variant="outline" size="icon" className="size-7">
              <Link to={`${ROUTE_UPDATE}/${id}`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
          )}
          {is_open && (
            <ButtonAction
              icon={CheckCheck}
              color="green"
              tooltip="Finalizar proceso"
              type="button"
              onClick={() => onClose(id)}
            />
          )}
          {is_open && <DeleteButton onClick={() => onDelete(id)} />}
        </div>
      );
    },
  },
];
