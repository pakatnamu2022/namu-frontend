"use client";
import { ColumnDef } from "@tanstack/react-table";
import {
  EvaluationPersonResource,
  EvaluationPersonResultResource,
} from "../lib/evaluationPerson.interface";
import { Badge } from "@/components/ui/badge";
import { parse } from "date-fns";
import { EditableCell } from "@/src/shared/components/EditableCell";
import { Flag, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { getScales } from "../../parametros/lib/parameter.hook";
import { cn } from "@/lib/utils";

export type EvaluationPersonObjectiveColumns =
  ColumnDef<EvaluationPersonResource>;

export const evaluationPersonObjectiveColumns = ({
  evaluationPersonResult,
  onUpdateCell,
  readOnly = false,
}: {
  evaluationPersonResult: EvaluationPersonResultResource;
  onUpdateCell: (id: number, value: number) => void;
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
        <div className="space-y-2 min-w-[300px] !text-wrap">
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

      // Función para obtener el color del badge de cumplimiento
      const getComplianceBadgeVariant = (compliance: number) => {
        if (compliance >= 100) return "default";
        else if (compliance >= 80) return "tertiary";
        else if (compliance >= 40 && compliance <= 60) return "secondary";
        else return "outline";
      };

      return (
        <div className="text-center">
          <Badge
            variant={getComplianceBadgeVariant(compliance)}
            className="font-medium"
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

      // Función para obtener el color del badge de calificación
      const getQualificationBadgeVariant = (qualification: number) => {
        if (qualification >= 80 && qualification <= 120) return "default";
        else if (qualification >= 60 && qualification <= 80) return "outline";
        else if (qualification >= 40 && qualification <= 60) return "secondary";
        else return "tertiary";
      };

      return (
        <div className="flex justify-center items-center gap-1">
          <Badge
            variant={getQualificationBadgeVariant(qualification)}
            className="font-medium"
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
  // {
  //   accessorKey: "end_date_objectives",
  //   header: "Fecha Límite",
  //   cell: ({ row }) => {
  //     const endDate = row.original.personCycleDetail?.end_date_objectives;

  //     // Función para obtener días restantes
  //     const getDaysRemaining = (endDate: string) => {
  //       if (!endDate) return 0;
  //       try {
  //         const today = new Date();
  //         const deadline = parse(endDate, "yyyy-MM-dd", new Date());
  //         const diffTime = deadline.getTime() - today.getTime();
  //         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //         return diffDays;
  //       } catch (error) {
  //         return 0;
  //       }
  //     };

  //     // Función para verificar si está vencido
  //     const isOverdue = (endDate: string) => {
  //       if (!endDate) return false;
  //       try {
  //         const today = new Date();
  //         const deadline = parse(endDate, "yyyy-MM-dd", new Date());
  //         return today > deadline;
  //       } catch (error) {
  //         return false;
  //       }
  //     };

  //     const daysRemaining = getDaysRemaining(endDate || "");
  //     const overdue = isOverdue(endDate || "");

  //     return (
  //       <div className="text-center">
  //         <div className="flex flex-col items-center gap-1">
  //           {endDate ? (
  //             <>
  //               <Badge
  //                 variant={overdue ? "secondary" : "outline"}
  //                 className="text-xs gap-1"
  //               >
  //                 <Calendar className="size-3" />
  //                 {format(
  //                   parse(endDate, "yyyy-MM-dd", new Date()),
  //                   "dd/MM/yyyy"
  //                 )}
  //               </Badge>
  //               {!overdue && daysRemaining >= 0 && (
  //                 <span className="text-xs text-muted-foreground">
  //                   {daysRemaining === 0
  //                     ? "Hoy"
  //                     : daysRemaining === 1
  //                     ? "1 día"
  //                     : `${daysRemaining} días`}
  //                 </span>
  //               )}
  //             </>
  //           ) : (
  //             <Badge variant="outline" className="text-xs">
  //               Sin fecha
  //             </Badge>
  //           )}
  //         </div>
  //       </div>
  //     );
  //   },
  // },
];
