"use client";
import type { ColumnDef } from "@tanstack/react-table";
import {
  EvaluationPersonResource,
  EvaluationPersonResultResource,
} from "../lib/evaluationPerson.interface";
import { Badge } from "@/components/ui/badge";
import { parse } from "date-fns";
import { EditableCell } from "@/shared/components/EditableCell";
import {
  Flag,
  Clock,
  ChevronUp,
  ChevronDown,
  MessageCircleMore,
  MessageCirclePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getScales } from "../../parametros/lib/parameter.hook";
import { cn } from "@/lib/utils";

export type EvaluationPersonObjectiveColumns =
  ColumnDef<EvaluationPersonResource>;

export const evaluationPersonObjectiveColumns = ({
  evaluationPersonResult,
  onUpdateCell,
  onToggleComment,
  readOnly = false,
}: {
  evaluationPersonResult: EvaluationPersonResultResource;
  onUpdateCell: (id: number, value: number) => void;
  onToggleComment?: (id: number) => void;
  readOnly?: boolean;
}): EvaluationPersonObjectiveColumns[] => [
  {
    accessorKey: "objective",
    header: "Objetivo y Meta",
    cell: ({ row }) => {
      const detail = row.original;
      const endDate = detail.evaluation;
      const wasEvaluated = detail.wasEvaluated;

      // Función para verificar si está vencido
      const isOverdue = (endDate: string) => {
        if (!endDate) return false;
        try {
          const today = new Date();
          const deadline = parse(endDate, "yyyy-MM-dd", new Date());
          return today > deadline;
        } catch (error) {
          return false;
        }
      };

      const overdue = isOverdue(endDate || "");

      return (
        <div className="space-y-2 min-w-[300px] text-wrap!">
          <div className="flex flex-col">
            <p className="text-sm font-medium leading-relaxed">
              {detail.personCycleDetail?.objective || "Sin objetivo definido"}
            </p>
            {detail.personCycleDetail?.objective_description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {detail.personCycleDetail.objective_description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs gap-1.5"
              tooltip={
                detail.personCycleDetail?.isAscending
                  ? "A mayor resultado, mejor cumplimiento"
                  : "A menor resultado, mejor cumplimiento"
              }
            >
              <Flag className="size-3 fill-current" />
              Meta: {detail.personCycleDetail?.goal}{" "}
              {detail.personCycleDetail?.metric || ""}
              {detail.personCycleDetail.isAscending ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
            </Badge>
            {overdue && !wasEvaluated && (
              <Badge variant="destructive" className="text-xs gap-1">
                <Clock className="size-3" />
                Vencido
              </Badge>
            )}
            {!overdue && !wasEvaluated && (
              <Badge variant="default" className="text-xs gap-1">
                <Clock className="size-3" />
                Pendiente
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "weight",
    header: "Peso",
    cell: ({ row }) => {
      const weight = row.original.personCycleDetail?.weight || 0;
      return (
        <div className="text-center">
          <Badge variant="outline" className="font-medium">
            {weight}%
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "result",
    header: "Resultado",
    cell: ({ row }) => {
      const detail = row.original;
      const result = detail.result;

      // Función para obtener el color del resultado
      const getResultVariant = (result: string | number) => {
        const numResult =
          typeof result === "string" ? parseFloat(result) : result;
        if (numResult >= 4) return "default";
        if (numResult >= 3) return "tertiary";
        if (numResult >= 2) return "outline";
        return "secondary";
      };

      return (
        <div className="flex items-center justify-center">
          {readOnly ? (
            <Badge variant={getResultVariant(result)}>{result || "0.00"}</Badge>
          ) : (
            <EditableCell
              variant="outline"
              id={detail.id}
              value={result}
              isNumber={true}
              onUpdate={onUpdateCell}
              widthClass="w-20"
              min={0}
              allowUpdateWithoutChange={true}
            />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "compliance",
    header: "Cumplimiento",
    cell: ({ row }) => {
      const compliance = Number(row.original.compliance) || 0;

      return (
        <div className="text-center">
          <Badge
            variant={"ghost"}
            className={cn(
              getScales(
                evaluationPersonResult?.objectiveParameter.details.length
              )[row.original.index_range_result]
            )}
          >
            {compliance.toFixed(1)}%
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "qualification",
    header: "Calificación",
    cell: ({ row }) => {
      const qualification = Number(row.original.qualification) || 0;

      return (
        <div className="flex flex-col justify-center items-center gap-1">
          <Badge
            variant={"ghost"}
            className={cn(
              getScales(
                evaluationPersonResult?.objectiveParameter.details.length
              )[row.original.index_range_result]
            )}
          >
            {qualification.toFixed(1)}%
          </Badge>
          <Badge
            variant={"ghost"}
            className={cn(
              getScales(
                evaluationPersonResult?.objectiveParameter.details.length
              )[row.original.index_range_result]
            )}
          >
            {row.original.label_range}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    size: 60,
    cell: ({ row }) => {
      const detail = row.original;
      const hasComment = !!detail.comment;

      return (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onToggleComment?.(detail.id)}
            aria-label={
              hasComment ? "Ver/editar comentario" : "Agregar comentario"
            }
            tooltip={
              hasComment ? "Ver/editar comentario" : "Agregar comentario"
            }
          >
            {hasComment ? (
              <MessageCircleMore className="h-4 w-4 text-primary" />
            ) : (
              <MessageCirclePlus className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      );
    },
  },
];
