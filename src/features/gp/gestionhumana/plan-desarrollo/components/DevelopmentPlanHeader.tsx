"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Target, Award, Trash2 } from "lucide-react";
import type { DevelopmentPlanResource } from "../lib/developmentPlan.interface";

interface DevelopmentPlanHeaderProps {
  plan: DevelopmentPlanResource;
  isLeader: boolean;
  expandedObjectivesCompetences: boolean;
  onToggleObjectivesCompetences: () => void;
  onDelete: () => void;
}

export function DevelopmentPlanHeader({
  plan,
  isLeader,
  expandedObjectivesCompetences,
  onToggleObjectivesCompetences,
  onDelete,
}: DevelopmentPlanHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <CardTitle className="text-lg leading-tight mb-1.5">
          {plan.title || "Plan de Desarrollo"}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-2 mb-2">
          {plan.description}
        </CardDescription>

        {plan.objectives_competences && plan.objectives_competences.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(expandedObjectivesCompetences
              ? plan.objectives_competences
              : plan.objectives_competences.slice(0, 3)
            ).map((item, index) => (
              <div key={index} className="contents">
                {item.objective_detail && (
                  <Badge
                    variant="outline"
                    icon={Target}
                    className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs py-0.5 h-6"
                  >
                    {item.objective_detail.objective}
                  </Badge>
                )}
                {item.competence_detail && (
                  <Badge
                    variant="outline"
                    icon={Award}
                    className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs py-0.5 h-6"
                  >
                    {item.competence_detail.competence}
                  </Badge>
                )}
              </div>
            ))}
            {plan.objectives_competences.length > 3 && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-muted/80 transition-colors text-xs py-0.5 h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleObjectivesCompetences();
                }}
              >
                {expandedObjectivesCompetences
                  ? "Ver menos"
                  : `+${plan.objectives_competences.length - 3}`}
              </Badge>
            )}
          </div>
        )}
      </div>
      {isLeader && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Eliminar plan"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}
