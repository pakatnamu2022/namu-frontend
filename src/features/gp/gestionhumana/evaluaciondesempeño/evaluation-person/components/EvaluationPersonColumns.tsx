"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { PanelLeft, RefreshCw } from "lucide-react";
import { EvaluationPersonResultResource } from "../lib/evaluationPerson.interface";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { EVALUATION_PERSON } from "../lib/evaluationPerson.constans";
import {
  getProgressColorBadge,
  getResultRateColorBadge,
} from "../lib/evaluationPerson.function";

export type EvaluationPersonColumn = ColumnDef<EvaluationPersonResultResource>;
const { ABSOLUTE_ROUTE } = EVALUATION_PERSON;

export const EvaluationPersonColumns = ({
  onRegenerate,
  onDelete,
}: {
  onRegenerate: (person_id: number, evaluation_id: number) => void;
  onDelete: (id: number) => void;
}): EvaluationPersonColumn[] => [
  {
    accessorKey: "person",
    header: "Nombres Completos",
    cell: ({ getValue }) => (
      <span className="font-semibold">
        {(getValue() as WorkerResource)?.name}
      </span>
    ),
  },
  {
    accessorKey: "supervisor",
    header: "Jefe Inmediato",
    cell: ({ getValue }) => (
      <span className="font-semibold">
        {(getValue() as WorkerResource)?.name}
      </span>
    ),
  },
  {
    accessorKey: "resultsPercentage",
    header: "Proporción (Obj - Com)",
    cell: ({ row }) => {
      const objectivesPercentage = row.original.objectivesPercentage;
      const competencesPercentage = row.original.competencesPercentage;

      return (
        <div className="flex justify-center items-center gap-2 w-full">
          <Badge className="min-w-16 justify-end" color="sky">
            {objectivesPercentage.toFixed(0) ?? 0}% -{" "}
            {competencesPercentage.toFixed(0) ?? 0}%
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "objectivesResult",
    header: "Resultado de Objetivos",
    cell: ({ row }) => {
      const objectivesResult = row.original.objectivesResult;
      return (
        <div className="flex justify-center items-center gap-2 w-full">
          <Badge
            className="min-w-16 justify-end"
            color={getResultRateColorBadge(objectivesResult)}
          >
            {objectivesResult.toFixed(2) ?? 0} %
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "competencesResult",
    header: "Resultado de Competencias",
    cell: ({ row }) => {
      const competencesResult = row.original.competencesResult;
      return (
        <div className="flex justify-center items-center gap-2 w-full">
          <Badge
            className="min-w-16 justify-end"
            color={getResultRateColorBadge(competencesResult)}
          >
            {competencesResult.toFixed(2) ?? 0} %
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "result",
    header: "Resultado Final",
    cell: ({ row }) => {
      const objectivesResult = row.original.result;
      return (
        <div className="flex justify-center items-center gap-2 w-full ">
          <Badge
            className="min-w-16 justify-end"
            color={getResultRateColorBadge(objectivesResult)}
          >
            {objectivesResult.toFixed(2) ?? 0} %
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "progress",
    header: "Progreso",
    cell: ({ row }) => {
      const total_progress = row.original.total_progress.completion_rate;
      return (
        <div className="flex justify-center items-center gap-2 w-full ">
          <Badge
            className="min-w-16 justify-end"
            color={getProgressColorBadge(total_progress)}
          >
            {total_progress.toFixed(2) ?? 0} %
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    size: 60,
    cell: ({ row }) => {
      const router = useNavigate();
      const id = row.original.person_id;
      const evaluationId = row.original.evaluation_id;
      const handleRegenerate = () => {
        onRegenerate(id, evaluationId);
      };

      return (
        <div className="flex items-center gap-2">
          {/* Detalle */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs!"
            tooltip="Ver Evaluación"
            onClick={() => router(`${ABSOLUTE_ROUTE}/${evaluationId}/${id}`)}
          >
            Evaluación
            <PanelLeft className="size-5" />
          </Button>

          {/* Regenerar */}
          <ConfirmationDialog
            trigger={
              <Button
                variant="outline"
                size="icon"
                className="h-7"
                tooltip="Restablecer Evaluación"
              >
                <RefreshCw className="size-5" />
              </Button>
            }
            title="Restablecer Evaluación"
            description="¿Estás seguro de que deseas regenerar la evaluación? Esta acción sobrescribirá los datos actuales de la evaluación."
            confirmText="Regenerar"
            cancelText="Cancelar"
            onConfirm={handleRegenerate}
            icon="warning"
          />

          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
