"use client";

import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ClipboardList,
  Eye,
  MapPin,
} from "lucide-react";
import { EvaluationPersonResultResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.interface";
import { EvaluationResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.interface";
import { Badge } from "@/components/ui/badge";
import { getMyEvaluatorTypes } from "../lib/teamHelpers";
import { getEvaluatorTypeById } from "../lib/teamConstants";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { cn } from "@/lib/utils";
import { getScales } from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.hook";
import { ParameterResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.interface";

interface TeamCardProps {
  data: EvaluationPersonResultResource;
  evaluation?: EvaluationResource | null;
  onEvaluate: (personId: number) => void;
  onHistory: (personId: number) => void;
}

export function TeamCard({
  data,
  evaluation,
  onEvaluate,
  onHistory,
}: TeamCardProps) {
  const { user } = useAuthStore();
  const { person, result, objectivesResult, competencesResult, statistics } =
    data;
  const myTypes = getMyEvaluatorTypes(data, user?.partner_id);
  const overallCompletionRate = statistics.overall_completion_rate;
  const isEvaluated = overallCompletionRate === 100;
  const isPending = overallCompletionRate < 100 && overallCompletionRate > 0;

  // Verificar si es evaluación de objetivos (typeEvaluation === 0)
  const isObjectivesOnly = evaluation?.typeEvaluation === 0;

  // Función para obtener el color según el resultado y el parámetro correspondiente
  const getResultColor = (
    resultValue: number,
    parameter: ParameterResource,
  ) => {
    if (!parameter?.details || parameter.details.length === 0) {
      return "";
    }

    // Encontrar el rango al que pertenece el resultado
    const rangeIndex = parameter.details.findIndex((detail) => {
      return resultValue >= detail.from && resultValue <= detail.to;
    });

    // Si no se encuentra un rango válido, retornar vacío
    if (rangeIndex === -1) {
      return "";
    }

    // Obtener las escalas de colores según la cantidad de rangos del parámetro
    const scales = getScales(parameter.details.length);
    return scales[rangeIndex] || "";
  };

  return (
    <div className="flex flex-col h-full rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
      {/* Contenido de la tarjeta */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        {/* Header: Nombre + Posición + Porcentaje */}
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-base truncate">{person.name}</span>
            <span className="text-sm text-muted-foreground truncate">
              {person.position}
            </span>
          </div>

          {/* Porcentaje de progreso destacado */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge
              color={isEvaluated ? "green" : isPending ? "amber" : "red"}
              icon={isEvaluated ? CheckCircle2 : isPending ? Clock : XCircle}
              className="text-xs"
            >
              {overallCompletionRate}%
            </Badge>
          </div>
        </div>

        {/* Metadata: Sede + Roles en una línea */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" icon={MapPin} className="text-xs">
            {person.sede.replace(/_/g, " ")}
          </Badge>
          {myTypes.length > 0 && (
            <>
              {myTypes.map((typeId) => {
                const typeConfig = getEvaluatorTypeById(typeId);
                if (!typeConfig) return null;
                return (
                  <Badge
                    key={typeId}
                    variant="outline"
                    icon={typeConfig.icon}
                    className="text-xs"
                  >
                    {typeConfig.shortName}
                  </Badge>
                );
              })}
            </>
          )}
        </div>

        {/* Resultados + Botones en la misma fila */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          {/* Resultados compactos */}
          {isObjectivesOnly ? (
            // Solo mostrar resultado final para evaluaciones de objetivos
            <div className="flex gap-2 items-center">
              <div
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1",
                  getResultColor(result, data.finalParameter),
                )}
              >
                <span className="text-sm font-bold">{result}%</span>
                <span className="text-[10px]">Final</span>
              </div>
            </div>
          ) : (
            // Mostrar todas las métricas para evaluaciones completas
            <div className="flex gap-2 items-center">
              <div
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1",
                  getResultColor(result, data.finalParameter),
                )}
              >
                <span className="text-sm font-bold">{result}%</span>
                <span className="text-[10px]">Total</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1",
                  getResultColor(objectivesResult, data.objectiveParameter),
                )}
              >
                <span className="text-xs font-semibold">
                  {objectivesResult}%
                </span>
                <span className="text-[10px]">Obj</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1",
                  getResultColor(competencesResult, data.competenceParameter),
                )}
              >
                <span className="text-xs font-semibold">
                  {competencesResult}%
                </span>
                <span className="text-[10px]">Comp</span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant={isEvaluated ? "default" : "secondary"}
              color={isEvaluated ? "emerald" : isPending ? "amber" : undefined}
              className="h-8 gap-1.5 px-3 text-xs"
              onClick={() => onEvaluate(person.id)}
            >
              <span className="hidden sm:inline">
                {isEvaluated ? "Ver" : isPending ? "Continuar" : "Evaluar"}
              </span>
              {isEvaluated ? (
                <Eye className="size-3" />
              ) : (
                <ClipboardList className="size-3" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 px-2 text-xs"
              onClick={() => onHistory(person.id)}
              title="Ver historial"
            >
              <ClipboardList className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
