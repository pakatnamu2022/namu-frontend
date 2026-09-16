"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { RecruitmentProcessResource } from "../lib/recruitmentProcess.interface.ts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCheck,
  History,
  MessageSquareQuote,
  PauseCircle,
  Pencil,
  PlayCircle,
  RotateCcw,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { RECRUITMENT_PROCESS } from "../lib/recruitmentProcess.constant.ts";

export type RecruitmentProcessColumns = ColumnDef<RecruitmentProcessResource>;

export const recruitmentProcessColumns = ({
  onClose,
  onDelete,
  onPause,
  onResume,
  onReopen,
  onHistory,
}: {
  onClose: (id: number) => void;
  onDelete: (id: number) => void;
  onPause: (row: RecruitmentProcessResource) => void;
  onResume: (id: number) => void;
  onReopen: (id: number) => void;
  onHistory: (row: RecruitmentProcessResource) => void;
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
        <div className="flex flex-col gap-1 items-start">
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
          {row.original.pausado && <Badge color="amber">Pausado</Badge>}
          {!!row.original.veces_pausado && (
            <span className="text-[11px] text-muted-foreground">
              Pausado {row.original.veces_pausado}{" "}
              {row.original.veces_pausado === 1 ? "vez" : "veces"}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { ROUTE_UPDATE, ABSOLUTE_ROUTE } = RECRUITMENT_PROCESS;
      const { id, is_open, pausado } = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" className="size-7">
            <Link to={`${ABSOLUTE_ROUTE}/postulantes?proceso_id=${id}`}>
              <Users className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="size-7">
            <Link to={`${ABSOLUTE_ROUTE}/entrevistas?proceso_id=${id}`}>
              <MessageSquareQuote className="size-4" />
            </Link>
          </Button>
          <ButtonAction
            icon={History}
            color="muted"
            tooltip="Historial y cobertura"
            type="button"
            onClick={() => onHistory(row.original)}
          />
          {is_open && (
            <Button asChild variant="outline" size="icon" className="size-7">
              <Link to={`${ROUTE_UPDATE}/${id}`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
          )}
          {is_open && !pausado && (
            <ButtonAction
              icon={PauseCircle}
              color="amber"
              tooltip="Pausar proceso"
              type="button"
              onClick={() => onPause(row.original)}
            />
          )}
          {is_open && pausado && (
            <ButtonAction
              icon={PlayCircle}
              color="blue"
              tooltip="Reanudar proceso"
              type="button"
              onClick={() => onResume(id)}
            />
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
          {!is_open && (
            <ButtonAction
              icon={RotateCcw}
              color="blue"
              tooltip="Reabrir proceso"
              type="button"
              onClick={() => onReopen(id)}
            />
          )}
          {is_open && <DeleteButton onClick={() => onDelete(id)} />}
        </div>
      );
    },
  },
];
