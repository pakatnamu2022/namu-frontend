"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Check, ShieldQuestion, History, Edit } from "lucide-react";
import { EvaluationPersonResultResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.interface";
import { Badge } from "@/components/ui/badge";
import { getMyEvaluatorTypes } from "../lib/teamHelpers";
import { getEvaluatorTypeById } from "../lib/teamConstants";
import { useAuthStore } from "@/features/auth/lib/auth.store";

export type TeamColumns = ColumnDef<EvaluationPersonResultResource>;

export const teamColumns = ({
  onEvaluate,
  onHistory,
}: {
  onEvaluate: (personId: number) => void;
  onHistory: (personId: number) => void;
}): TeamColumns[] => [
  {
    id: "employee_card",
    header: "Evaluación de Desempeño",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { user } = useAuthStore();
      const { person, result, objectivesResult, competencesResult, statistics } = row.original;
      const myTypes = getMyEvaluatorTypes(row.original, user?.partner_id);
      const overallCompletionRate = statistics.overall_completion_rate;
      const isEvaluated = overallCompletionRate === 100;
      const isPending = overallCompletionRate < 100 && overallCompletionRate > 0;

      return (
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 py-3 px-2 w-full">
          {/* Sección superior/izquierda: Info del empleado */}
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            {/* Header: Nombre + Estado */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base sm:text-lg truncate">{person.name}</span>
                <span className="text-sm text-muted-foreground">{person.position}</span>
              </div>
              <Badge
                variant={isEvaluated ? "default" : "destructive"}
                className="gap-1 w-fit shrink-0"
              >
                {isEvaluated ? "Evaluado" : isPending ? "Pendiente" : "No Evaluado"}
                {isEvaluated ? (
                  <Check className="size-3" />
                ) : (
                  <ShieldQuestion className="size-3" />
                )}
              </Badge>
            </div>

            {/* Tags: Sede + Roles */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {person.sede}
              </Badge>
              {myTypes.length > 0 && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  {myTypes.map((typeId) => {
                    const typeConfig = getEvaluatorTypeById(typeId);
                    if (!typeConfig) return null;
                    const Icon = typeConfig.icon;
                    return (
                      <Badge
                        key={typeId}
                        variant={typeConfig.color}
                        className="text-xs gap-1"
                      >
                        <Icon className="h-3 w-3" />
                        {typeConfig.shortName}
                      </Badge>
                    );
                  })}
                </>
              )}
            </div>

            {/* Resultados + Progreso en layout horizontal */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* Resultados */}
              <div className="flex gap-2 items-center flex-wrap">
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-md px-3 py-1.5">
                  <span className="text-lg sm:text-xl font-bold">{result}%</span>
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/30 rounded-md px-2.5 py-1">
                  <span className="text-sm font-semibold">{objectivesResult}%</span>
                  <span className="text-xs text-muted-foreground">Obj</span>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/30 rounded-md px-2.5 py-1">
                  <span className="text-sm font-semibold">{competencesResult}%</span>
                  <span className="text-xs text-muted-foreground">Comp</span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="flex items-center gap-2 w-full sm:flex-1 sm:max-w-[200px]">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${overallCompletionRate}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground shrink-0 min-w-[35px] text-right">
                  {overallCompletionRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Sección inferior/derecha: Acciones */}
          <div className="flex sm:flex-row lg:flex-col gap-2 w-full sm:w-auto lg:w-auto shrink-0">
            <Button
              size="sm"
              variant={isEvaluated ? "outline" : "default"}
              className="h-9 gap-2 flex-1 sm:flex-initial sm:min-w-[110px]"
              onClick={() => onEvaluate(person.id)}
            >
              {isEvaluated ? "Ver Activa" : isPending ? "Continuar" : "Evaluar"}
              <Edit className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-2 flex-1 sm:flex-initial sm:min-w-[110px]"
              onClick={() => onHistory(person.id)}
            >
              Historial
              <History className="size-4" />
            </Button>
          </div>
        </div>
      );
    },
  },
];
