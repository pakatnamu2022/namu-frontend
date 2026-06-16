"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { Subcompetence } from "../lib/evaluationPerson.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  User,
  Users,
  UserCheck,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import {
  getProgressColorBadge,
  getResultRateColorBadge,
} from "../lib/evaluationPerson.function";

export type EvaluationPersonCompetenceColumns = ColumnDef<Subcompetence>;

const scoreColors = ["orange", "amber", "lime", "emerald"] as const;

// Componente fuera de la factory para que React mantenga el estado entre renders
function EvaluationCell({
  evaluator,
  readOnly,
  onUpdateCell,
}: {
  evaluator?: any;
  readOnly: boolean;
  onUpdateCell: (id: number, value: number) => Promise<void>;
}) {
  const serverValue = Number(evaluator?.result) || 0;
  const [optimistic, setOptimistic] = useState(serverValue);

  useEffect(() => {
    setOptimistic(serverValue);
  }, [serverValue]);

  if (readOnly) {
    return (
      <Badge
        color={getResultRateColorBadge(evaluator?.result || "0.00")}
        className="text-xs"
      >
        {evaluator?.result || "0.00"}
      </Badge>
    );
  }

  if (!evaluator?.id) {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        Pendiente
      </Badge>
    );
  }

  const handleClick = async (value: number) => {
    const prev = optimistic;
    setOptimistic(value);
    try {
      await onUpdateCell(evaluator.id, value);
    } catch {
      setOptimistic(prev);
    }
  };

  return (
    <div className="flex gap-1">
      {scoreColors.map((color, i) => {
        const value = i + 1;
        return (
          <Button
            key={value}
            size="icon-xs"
            variant={optimistic === value ? "default" : "outline"}
            color={color}
            onClick={() => handleClick(value)}
          >
            {value}
          </Button>
        );
      })}
    </div>
  );
}

export const evaluationPersonCompetenceColumns = ({
  onUpdateCell,
  readOnly = false,
  evaluationType = 2,
  requiredEvaluatorTypes = [0, 1, 2, 3],
  canEditAll = false,
}: {
  onUpdateCell: (id: number, value: number) => Promise<void>;
  readOnly?: boolean;
  evaluationType?: number;
  requiredEvaluatorTypes?: number[];
  competenceMaxScore?: number;
  canEditAll?: boolean;
}): EvaluationPersonCompetenceColumns[] => {
  const baseColumns: EvaluationPersonCompetenceColumns[] = [
    {
      accessorKey: "sub_competence_name",
      header: "Sub-competencia",
      cell: ({ row }) => {
        const subCompetence = row.original;
        return (
          <div className="flex flex-col min-w-[250px]">
            <p className="text-sm font-medium leading-relaxed">
              {subCompetence.sub_competence_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {subCompetence.sub_competence_description}
            </p>
          </div>
        );
      },
    },
  ];

  const evaluatorColumns: EvaluationPersonCompetenceColumns[] = [];

  if (evaluationType === 1) {
    // 180° - Solo jefe directo
    evaluatorColumns.push({
      accessorKey: "jefe_directo",
      header: () => (
        <div className="flex items-center justify-center gap-1">
          <User className="size-3" />
          <span>Jefe Directo</span>
        </div>
      ),
      cell: ({ row }) => {
        const subCompetence = row.original;
        const jefeEvaluator = subCompetence.evaluators?.find(
          (e) => e.evaluator_type === 0,
        );
        return (
          <div className="w-full flex justify-center">
            <EvaluationCell
              evaluator={jefeEvaluator}
              readOnly={readOnly}
              onUpdateCell={onUpdateCell}
            />
          </div>
        );
      },
    });
  } else {
    // 360° - Múltiples evaluadores
    const evaluatorTypes = [
      { type: 0, name: "Jefe (60%)", icon: User },
      { type: 1, name: "Auto (20%)", icon: Target },
      { type: 2, name: "Pares (10%)", icon: Users },
      { type: 3, name: "Reportes (10%)", icon: UserCheck },
    ];

    const { user } = useAuthStore();

    evaluatorTypes.forEach(({ type, name, icon: Icon }) => {
      if (requiredEvaluatorTypes.includes(type)) {
        const shouldShowColumn = type !== 3 || canEditAll;

        if (shouldShowColumn) {
          evaluatorColumns.push({
            accessorKey: `evaluator_${type}`,
            header: () => (
              <div className="flex items-center justify-center gap-1">
                <Icon className="size-3" />
                <span>{name}</span>
              </div>
            ),
            cell: ({ row }) => {
              const subCompetence = row.original;
              const evaluator = subCompetence.evaluators?.find((e) => {
                if (type === 3 && !canEditAll) {
                  return (
                    e.evaluator_type === type &&
                    e.evaluator_id === user.partner_id
                  );
                }
                return e.evaluator_type === type;
              });

              const isMyEvaluation =
                evaluator?.evaluator_id === user.partner_id;
              const shouldBeReadOnly =
                readOnly || (!canEditAll && !isMyEvaluation);

              return (
                <div className="flex items-center justify-center">
                  <EvaluationCell
                    evaluator={evaluator}
                    readOnly={shouldBeReadOnly}
                    onUpdateCell={onUpdateCell}
                  />
                </div>
              );
            },
          });
        } else if (type === 3) {
          evaluatorColumns.push({
            accessorKey: `evaluator_${type}`,
            header: () => (
              <div className="flex items-center justify-center gap-1">
                <Icon className="size-3" />
                <span>{name}</span>
              </div>
            ),
            cell: ({ row }) => {
              const subCompetence = row.original;
              const evaluator = subCompetence.evaluators?.find((e) => {
                return (
                  e.evaluator_type === type &&
                  e.evaluator_id === user.partner_id
                );
              });

              if (!evaluator) {
                return null;
              }

              return (
                <div className="flex items-center justify-center">
                  <EvaluationCell
                    evaluator={evaluator}
                    readOnly={readOnly}
                    onUpdateCell={onUpdateCell}
                  />
                </div>
              );
            },
          });
        }
      }
    });
  }

  const finalAverageColumn: EvaluationPersonCompetenceColumns = {
    accessorKey: "average_result",
    header: () => (
      <div className="flex items-center justify-center gap-1 font-semibold">
        <TrendingUp className="size-3" />
        <span>Promedio Final</span>
      </div>
    ),
    cell: ({ row }) => {
      const subCompetence = row.original;
      return (
        <div className="text-center py-1 rounded">
          <Badge
            color={getResultRateColorBadge(subCompetence.average_result || 0)}
            className="font-semibold"
          >
            {(subCompetence.average_result || 0).toFixed(2)}
          </Badge>
        </div>
      );
    },
  };

  const statusColumn: EvaluationPersonCompetenceColumns = {
    accessorKey: "completion_percentage",
    header: () => (
      <div className="flex items-center justify-center gap-1">
        <CheckCircle2 className="size-3" />
        <span>Avance</span>
      </div>
    ),
    cell: ({ row }) => {
      const subCompetence = row.original;
      const completionPercentage = subCompetence.completion_percentage || 0;

      return (
        <div className="text-center space-y-1">
          <Badge
            color={getProgressColorBadge(completionPercentage)}
            className="text-xs"
          >
            {Math.round(completionPercentage)}%
          </Badge>
        </div>
      );
    },
  };

  return [
    ...baseColumns,
    ...evaluatorColumns,
    finalAverageColumn,
    statusColumn,
  ];
};
