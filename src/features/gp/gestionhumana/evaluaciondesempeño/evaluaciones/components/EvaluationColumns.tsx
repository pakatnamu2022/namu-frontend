"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EvaluationResource } from "../lib/evaluation.interface";
import { Button } from "@/components/ui/button";
import {
  PanelRightClose,
  Pencil,
  Bell,
  BellRing,
  CheckCircle,
  BellDot,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { EVALUATION, STATUS_EVALUATION } from "../lib/evaluation.constans";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "date-fns";
import { Link } from "react-router-dom";
import { EditableSelectCell } from "@/shared/components/EditableSelectCell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const { ROUTE_UPDATE, ABSOLUTE_ROUTE } = EVALUATION;

export type EvaluationColumns = ColumnDef<EvaluationResource>;

export const evaluationColumns = ({
  onDelete,
  onStatusUpdate,
  onSendOpenedNotification,
  onSendReminderNotification,
  onSendClosedNotification,
}: {
  onDelete: (id: number) => void;
  onStatusUpdate: (id: number, status: number | string) => void;
  onSendOpenedNotification: (id: number) => void;
  onSendReminderNotification: (id: number) => void;
  onSendClosedNotification: (id: number) => void;
}): EvaluationColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Link
          to={`${ABSOLUTE_ROUTE}/${id}`}
          className="font-semibold underline text-primary"
        >
          {row.original.name}
        </Link>
      );
    },
  },
  {
    header: "Intérvalo de Evaluación",
    accessorFn: (row) => row,
    cell: ({ getValue }) => {
      const evaluation = getValue() as EvaluationResource;
      return (
        <div className="font-semibold">
          <Badge color="default">
            {format(
              parse(evaluation.start_date as string, "yyyy-MM-dd", new Date()),
              "dd/MM/yyyy"
            )}
          </Badge>
          <span className="mx-1">-</span>
          <Badge color="default">
            {format(
              parse(evaluation.end_date as string, "yyyy-MM-dd", new Date()),
              "dd/MM/yyyy"
            )}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "typeEvaluationName",
    header: "Tipo de Evaluación",
    cell: ({ row }) => {
      const evaluation = row.original as EvaluationResource;
      return (
        <Badge
          variant={
            evaluation.typeEvaluation === 0
              ? "tertiary"
              : evaluation.typeEvaluation === 1
              ? "default"
              : "outline"
          }
        >
          {evaluation.typeEvaluationName}
        </Badge>
      );
    },
  },
  {
    accessorKey: "proporcion",
    header: "Proporción (Obj - Com)",
    cell: ({ row }) => {
      const evaluation = row.original as EvaluationResource;
      const objectives = parseFloat(evaluation.objectivesPercentage);
      const competences = parseFloat(evaluation.competencesPercentage);
      return (
        <Badge variant={"outline"}>
          {objectives}% - {competences}%
        </Badge>
      );
    },
  },
  {
    accessorKey: "cycle",
    accessorFn: (row) => row.cycle,
    header: "Ciclo",
  },
  {
    accessorKey: "statusName",
    header: "Estado",
    cell: ({ row }) => {
      const evaluation = row.original as EvaluationResource;
      return (
        <EditableSelectCell
          id={evaluation.id}
          value={evaluation.status}
          onUpdate={onStatusUpdate}
          options={STATUS_EVALUATION}
          widthClass="w-auto"
        />
      );
    },
  },
  {
    accessorKey: "send_opened_email",
    header: "Email Apertura",
    cell: ({ row }) => {
      const evaluation = row.original as EvaluationResource;
      return (
        <Badge variant={evaluation.send_opened_email ? "default" : "secondary"}>
          {evaluation.send_opened_email ? "Enviado" : "No enviado"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "send_closed_email",
    header: "Email Cierre",
    cell: ({ row }) => {
      const evaluation = row.original as EvaluationResource;
      return (
        <Badge variant={evaluation.send_closed_email ? "default" : "secondary"}>
          {evaluation.send_closed_email ? "Enviado" : "No enviado"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "objectiveParameter",
    header: "Parametro Objetivos",
  },
  {
    accessorKey: "competenceParameter",
    header: "Parametro Competencias",
  },
  {
    accessorKey: "finalParameter",
    header: "Parametro Final",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const evaluation = row.original as EvaluationResource;
      const id = evaluation.id;

      return (
        <div className="flex items-center gap-2">
          {/* PanelRightClose  */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Ver evaluación"
            onClick={() => router(`${ABSOLUTE_ROUTE}/${id}`)}
          >
            <PanelRightClose className="size-5" />
          </Button>

          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
          >
            <Pencil className="size-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                tooltip="Notificaciones"
              >
                <BellDot className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {!evaluation.send_open_notifications && (
                <>
                  <DropdownMenuItem
                    onClick={() => onSendOpenedNotification(id)}
                    className="cursor-pointer"
                  >
                    <Bell className="mr-2 size-4" />
                    <span>Notificar inicio</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem
                onClick={() => onSendReminderNotification(id)}
                className="cursor-pointer"
              >
                <BellRing className="mr-2 size-4" />
                <span>Enviar recordatorio</span>
              </DropdownMenuItem>

              {!evaluation.send_close_notifications && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onSendClosedNotification(id)}
                    className="cursor-pointer"
                  >
                    <CheckCircle className="mr-2 size-4" />
                    <span>Notificar finalización</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
