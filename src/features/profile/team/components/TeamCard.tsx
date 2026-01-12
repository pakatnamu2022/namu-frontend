"use client";

import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  XCircle,
  History,
  Edit,
  MapPin,
} from "lucide-react";
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
    <div className="flex flex-col h-full rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
      {/* Contenido de la tarjeta */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        {/* Header: Nombre + Posición */}
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-base truncate">{person.name}</span>
          <span className="text-sm text-muted-foreground truncate">
            {person.position}
          </span>
        </div>

        {/* Tags: Sede + Estado + Roles */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="blue" icon={MapPin} className="text-xs">
            {person.sede.replace(/_/g, " ")}
          </Badge>
          <Badge
            variant={isEvaluated ? "green" : isPending ? "amber" : "red"}
            icon={isEvaluated ? CheckCircle2 : isPending ? Clock : XCircle}
            className="text-xs"
          >
            {overallCompletionRate}%
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

        {/* Resultados compactos */}
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-1 bg-muted/50 rounded-md px-2 py-1">
            <span className="text-sm font-bold">{result}%</span>
            <span className="text-[10px] text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-1 bg-muted/30 rounded-md px-2 py-1">
            <span className="text-xs font-semibold">{objectivesResult}%</span>
            <span className="text-[10px] text-muted-foreground">Obj</span>
          </div>
          <div className="flex items-center gap-1 bg-muted/30 rounded-md px-2 py-1">
            <span className="text-xs font-semibold">{competencesResult}%</span>
            <span className="text-[10px] text-muted-foreground">Comp</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 mt-auto">
          <Button
            size="sm"
            variant={isEvaluated ? "outline" : "default"}
            className="h-8 gap-1.5 px-3 text-xs flex-1"
            onClick={() => onEvaluate(person.id)}
          >
            {isEvaluated ? "Ver Activa" : isPending ? "Continuar" : "Evaluar"}
            <Edit className="size-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 px-3 text-xs flex-1"
            onClick={() => onHistory(person.id)}
          >
            Historial
            <History className="size-3" />
          </Button>
        </div>
      </div>

      {/* Barra de progreso pegada al final */}
      <div className="w-full h-2 bg-muted">
        <div
          className={`h-full transition-all ${getProgressColor()}`}
          style={{ width: `${overallCompletionRate}%` }}
        />
      </div>
    </div>
  );
}
