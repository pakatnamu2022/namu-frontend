"use client";

import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { EvaluationPersonResultResource } from "../lib/evaluationPerson.interface";

interface EvaluationHeaderProps {
  evaluationPersonResult: EvaluationPersonResultResource;
  completedObjectives: number;
  totalObjectives: number;
  showProgress?: boolean;
}

export default function EvaluationHeader({
  evaluationPersonResult,
  completedObjectives,
  totalObjectives,
  showProgress = true,
}: EvaluationHeaderProps) {
  return (
    <div className="bg-muted/50 p-4 rounded-lg border">
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="size-5 text-primary" />
          <div>
            <h3 className="font-semibold text-lg">Evaluación de Objetivos</h3>
            <p className="text-sm text-muted-foreground">
              Resultados y metas personales del período
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {showProgress && (
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {evaluationPersonResult.objectivesResult.toFixed(1)}/
                  {evaluationPersonResult.maxObjectiveParameter}
                </span>
              </div>
              <Progress
                value={
                  (evaluationPersonResult.objectivesResult /
                    (evaluationPersonResult.maxObjectiveParameter ?? 1)) *
                  100
                }
                className="w-24 h-2"
              />
            </div>
          )}

          <div className="text-right text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              {completedObjectives}/{totalObjectives}
            </div>
            <span>Completados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
