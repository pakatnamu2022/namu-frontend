"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { PanelLeft, RefreshCw } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { EvaluationPersonResultResource } from "../lib/evaluationPerson.interface";
import { WorkerResource } from "../../../personal/trabajadores/lib/worker.interface";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type EvaluationPersonColumn = ColumnDef<EvaluationPersonResultResource>;

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
    accessorKey: "resultsPercentage",
    header: "Proporción (Obj - Com)",
    cell: ({ row }) => {
      const objectivesPercentage = row.original.objectivesPercentage;
      const competencesPercentage = row.original.competencesPercentage;

      return (
        <div className="flex justify-center items-center gap-2 w-full">
          <Badge className="min-w-16 justify-end" variant={"tertiary"}>
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
          <Badge className="min-w-16 justify-end" variant={"outline"}>
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
          <Badge className="min-w-16 justify-end" variant={"outline"}>
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
          <Badge className="min-w-16 justify-end" variant={"default"}>
            {objectivesResult.toFixed(2) ?? 0} %
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
      const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

      const handleRegenerate = () => {
        onRegenerate(id, evaluationId);
        setShowRegenerateDialog(false);
      };

      return (
        <div className="flex items-center gap-2">
          {/* Detalle */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => router(`./${evaluationId}/${id}`)}
          >
            Evaluación
            <PanelLeft className="size-5" />
          </Button>

          {/* Regenerar */}
          <Button
            variant="outline"
            size="icon"
            className="h-7 text-xs"
            onClick={() => setShowRegenerateDialog(true)}
            tooltip="Restablecer Evaluación"
          >
            <RefreshCw className="size-5" />
          </Button>

          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />

          {/* Confirmation Dialog */}
          <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Restablecer Evaluación</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que deseas regenerar la evaluación? Esta acción sobrescribirá los datos actuales de la evaluación.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleRegenerate}>
                  Regenerar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
