"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { Subcompetence } from "../lib/evaluationPerson.interface";
import { Badge } from "@/components/ui/badge";
import { EditableCell } from "@/shared/components/EditableCell";
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
  competenceMaxScore, // Puntaje máximo por competencia
  canEditAll = false, // Vista de administrador - puede editar todas las columnas
}: {
  onUpdateCell: (id: number, value: number) => void;
  readOnly?: boolean;
  evaluationType?: number;
  requiredEvaluatorTypes?: number[];
  competenceMaxScore: number;
  canEditAll?: boolean;
}): EvaluationPersonCompetenceColumns[] => {
  // Componente para celdas de evaluación
  const EvaluationCell = ({
    evaluator,
    readOnly,
    max,
  }: {
    evaluator?: any;
    readOnly: boolean;
    max: number;
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
      // No hay evaluación asignada
      return (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          Pendiente
        </Badge>
      );
    }

    return (
      <EditableCell
        variant="outline"
        id={evaluator.id}
        value={evaluator.result}
        isNumber={true}
        onUpdate={onUpdateCell}
        widthClass="w-24"
        min={1}
        max={max}
      />
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
              max={competenceMaxScore}
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
                    max={competenceMaxScore}
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
                    max={competenceMaxScore}
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
