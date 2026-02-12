"use client";

import { Badge } from "@/components/ui/badge";
import { EvaluationPersonResultResource } from "../lib/evaluationPerson.interface";
import { getResultRateColorBadge } from "../lib/evaluationPerson.function";

interface EvaluationFooterProps {
  evaluationPersonResult: EvaluationPersonResultResource;
  totalObjectives: number;
  completedObjectives: number;
}

export default function EvaluationFooter({
  evaluationPersonResult,
  totalObjectives,
  completedObjectives,
}: EvaluationFooterProps) {
  return (
    <div className="bg-muted/20 p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center justify-start gap-3">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-medium">{totalObjectives}</span>
        </div>
        <div className="flex items-center justify-start gap-3">
          <span className="text-muted-foreground">Completados:</span>
          <span className="font-medium">{completedObjectives}</span>
        </div>
        <div className="flex items-center justify-start gap-3">
          <span className="text-muted-foreground">Calificación:</span>
          <Badge
            color={getResultRateColorBadge(
              evaluationPersonResult.objectivesResult || 0,
            )}
          >
            {evaluationPersonResult.objectivesResult.toFixed(1)}%
          </Badge>
        </div>
      </div>
    </div>
  );
}
