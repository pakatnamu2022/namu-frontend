"use client";
import type { ColumnDef } from "@tanstack/react-table";
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

export const evaluationPersonCompetenceColumns = ({
  onUpdateCell,
  readOnly = false,
  evaluationType = 2, // 1 = 180°, 2 = 360°
  requiredEvaluatorTypes = [0, 1, 2, 3], // Tipos de evaluadores requeridos
  canEditAll = false, // Vista de administrador - puede editar todas las columnas
}: {
  onUpdateCell: (id: number, value: number) => void;
  readOnly?: boolean;
  evaluationType?: number;
  requiredEvaluatorTypes?: number[];
  competenceMaxScore?: number;
  canEditAll?: boolean;
}): EvaluationPersonCompetenceColumns[] => {
  const scoreButtons = [
    { value: 1, color: "border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30", activeColor: "bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-950/50" },
    { value: 2, color: "border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30", activeColor: "bg-orange-100 border-orange-500 text-orange-700 dark:bg-orange-950/50" },
    { value: 3, color: "border-lime-400 text-lime-600 hover:bg-lime-50 dark:hover:bg-lime-950/30", activeColor: "bg-lime-100 border-lime-500 text-lime-700 dark:bg-lime-950/50" },
    { value: 4, color: "border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30", activeColor: "bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-950/50" },
  ];

  // Componente para celdas de evaluación
  const EvaluationCell = ({
    evaluator,
    readOnly,
  }: {
    evaluator?: any;
    readOnly: boolean;
  }) => {
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

    const current = Number(evaluator.result) || 0;

    return (
      <div className="flex gap-1">
        {scoreButtons.map(({ value, color, activeColor }) => (
          <Button
            key={value}
            size="sm"
            variant="outline"
            className={`h-6 w-6 p-0 text-xs font-semibold border transition-colors ${current === value ? activeColor : color}`}
            onClick={() => onUpdateCell(evaluator.id, value)}
          >
            {value}
          </Button>
        ))}
      </div>
    );
  };

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

  // Columnas dinámicas según el tipo de evaluación
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
        // Para tipo 3 (Reportes) puede haber múltiples evaluadores
        // Solo mostrar la columna si el usuario actual es uno de ellos
        // Para otros tipos, siempre mostrar la columna
        const shouldShowColumn = type !== 3 || canEditAll;

        // Si no es tipo 3, o si es admin, mostrar la columna normalmente
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
              // Buscar el evaluador de este tipo específico
              // Para tipo 3, buscar específicamente el que corresponde al usuario actual
              const evaluator = subCompetence.evaluators?.find((e) => {
                if (type === 3 && !canEditAll) {
                  // Para Reportes, buscar el evaluador que es el usuario actual
                  return (
                    e.evaluator_type === type &&
                    e.evaluator_id === user.partner_id
                  );
                }
                // Para otros tipos, buscar por tipo
                return e.evaluator_type === type;
              });

              // Solo permitir edición si:
              // 1. canEditAll es true (vista de administrador) O
              // 2. El evaluador de este tipo es el usuario actual
              const isMyEvaluation =
                evaluator?.evaluator_id === user.partner_id;
              const shouldBeReadOnly =
                readOnly || (!canEditAll && !isMyEvaluation);

              return (
                <div className="flex items-center justify-center">
                  <EvaluationCell
                    evaluator={evaluator}
                    readOnly={shouldBeReadOnly}
                  />
                </div>
              );
            },
          });
        } else if (type === 3) {
          // Para tipo 3, verificar si el usuario actual es un evaluador de este tipo
          // Necesitamos revisar al menos una subcompetencia para saber si mostrar la columna
          // Esto se hace de forma dinámica en cada fila
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
              // Buscar el evaluador tipo 3 que es el usuario actual
              const evaluator = subCompetence.evaluators?.find((e) => {
                return (
                  e.evaluator_type === type &&
                  e.evaluator_id === user.partner_id
                );
              });

              // Solo mostrar si existe un evaluador para este usuario
              if (!evaluator) {
                return null;
              }

              const isMyEvaluation = true; // Siempre es mi evaluación si llegamos aquí
              const shouldBeReadOnly = readOnly || !isMyEvaluation;

              return (
                <div className="flex items-center justify-center">
                  <EvaluationCell
                    evaluator={evaluator}
                    readOnly={shouldBeReadOnly}
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

  // Columna de estado/progreso
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
