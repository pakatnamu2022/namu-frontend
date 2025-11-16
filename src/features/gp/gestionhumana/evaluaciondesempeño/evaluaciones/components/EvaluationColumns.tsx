"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EvaluationResource } from "../lib/evaluation.interface";
import { Button } from "@/components/ui/button";
import { PanelRightClose, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { EVALUATION, STATUS_EVALUATION } from "../lib/evaluation.constans";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "date-fns";
import Link from "next/link";
import { EditableSelectCell } from "@/src/shared/components/EditableSelectCell";

const { ROUTE_UPDATE } = EVALUATION;

export type EvaluationColumns = ColumnDef<EvaluationResource>;

export const evaluationColumns = ({
  onDelete,
  onStatusUpdate,
}: {
  onDelete: (id: number) => void;
  onStatusUpdate: (id: number, status: number | string) => void;
}): EvaluationColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Link
          href={`./evaluaciones/${id}`}
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
          <Badge variant="default">
            {format(
              parse(evaluation.start_date as string, "yyyy-MM-dd", new Date()),
              "dd/MM/yyyy"
            )}
          </Badge>
          <span className="mx-1">-</span>
          <Badge variant="default">
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
      const router = useRouter();
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* PanelRightClose  */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Ver evaluación"
            onClick={() => router.push(`./evaluaciones/${id}`)}
          >
            <PanelRightClose className="size-5" />
          </Button>

          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router.push(`./${ROUTE_UPDATE}/${id}`)}
          >
            <Pencil className="size-5" />
          </Button>
          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
