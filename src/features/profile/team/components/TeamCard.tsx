"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, History, Edit, MapPin } from "lucide-react";
import { EvaluationPersonResultResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.interface";
import { Badge } from "@/components/ui/badge";
import { getMyEvaluatorTypes } from "../lib/teamHelpers";
import { getEvaluatorTypeById } from "../lib/teamConstants";
import { useAuthStore } from "@/features/auth/lib/auth.store";

interface TeamCardProps {
  data: EvaluationPersonResultResource;
  onEvaluate: (personId: number) => void;
  onHistory: (personId: number) => void;
}

export function TeamCard({ data, onEvaluate, onHistory }: TeamCardProps) {
  const { user } = useAuthStore();
  const { person, result, objectivesResult, competencesResult, statistics } =
    data;
  const myTypes = getMyEvaluatorTypes(data, user?.partner_id);
  const overallCompletionRate = statistics.overall_completion_rate;
  const isEvaluated = overallCompletionRate === 100;
  const isPending = overallCompletionRate < 100 && overallCompletionRate > 0;

  // Color del progress bar según el porcentaje
  const getProgressColor = () => {
    if (overallCompletionRate === 100) return "bg-green-500";
    if (overallCompletionRate >= 50) return "bg-amber-500";
    if (overallCompletionRate > 0) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 py-3 px-2 w-full">
      {/* Sección superior/izquierda: Info del empleado */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {/* Header: Nombre + Posición */}
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm sm:text-base lg:text-lg truncate">
            {person.name}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground">
            {person.position}
          </span>
        </div>

        {/* Tags: Sede + Roles */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="blue" icon={MapPin} className="text-xs">
            {person.sede}
          </Badge>
          {myTypes.length > 0 && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              {myTypes.map((typeId) => {
                const typeConfig = getEvaluatorTypeById(typeId);
                if (!typeConfig) return null;
                return (
                  <Badge
                    key={typeId}
                    variant={typeConfig.color}
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
              <span className="text-sm font-semibold">
                {competencesResult}%
              </span>
              <span className="text-xs text-muted-foreground">Comp</span>
            </div>
          </div>

          {/* Badge de estado + Barra de progreso */}
          <div className="flex items-center gap-2 w-full sm:flex-1">
            <Badge
              variant={isEvaluated ? "green" : isPending ? "amber" : "red"}
              icon={isEvaluated ? CheckCircle2 : isPending ? Clock : XCircle}
              className="shrink-0"
              size="xs"
            >
              {overallCompletionRate}%
            </Badge>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getProgressColor()}`}
                style={{ width: `${overallCompletionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección inferior/derecha: Acciones */}
      <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0">
        <Button
          size="sm"
          variant={isEvaluated ? "outline" : "default"}
          className="h-8 lg:h-9 gap-1.5 lg:gap-2 flex-1 lg:flex-initial lg:min-w-[110px] text-xs lg:text-sm"
          onClick={() => onEvaluate(person.id)}
        >
          {isEvaluated ? "Ver Activa" : isPending ? "Continuar" : "Evaluar"}
          <Edit className="size-3 lg:size-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 lg:h-9 gap-1.5 lg:gap-2 flex-1 lg:flex-initial lg:min-w-[110px] text-xs lg:text-sm"
          onClick={() => onHistory(person.id)}
        >
          Historial
          <History className="size-3 lg:size-4" />
        </Button>
      </div>
    </div>
  );
}
