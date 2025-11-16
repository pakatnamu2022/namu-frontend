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

export type EvaluationPersonCompetenceColumns = ColumnDef<Subcompetence>;

export const evaluationPersonCompetenceColumns = ({
  onUpdateCell,
  readOnly = false,
  evaluationType = 2, // 1 = 180°, 2 = 360°
  requiredEvaluatorTypes = [0, 1, 2, 3], // Tipos de evaluadores requeridos
  competenceMaxScore, // Puntaje máximo por competencia
}: {
  onUpdateCell: (id: number, value: number) => void;
  readOnly?: boolean;
  evaluationType?: number;
  requiredEvaluatorTypes?: number[];
  competenceMaxScore: number;
}): EvaluationPersonCompetenceColumns[] => {
  // Función para obtener el color del resultado
  const getResultVariant = (result: string | number) => {
    const numResult = typeof result === "string" ? parseFloat(result) : result;
    if (numResult >= 4) return "default"; // Verde
    if (numResult >= 3) return "tertiary"; // Azul
    if (numResult >= 2) return "outline"; // Gris
    return "secondary"; // Rojo
  };

  // Función para obtener el ícono del tipo de evaluador
  // const getEvaluatorIcon = (type: number) => {
  //   switch (type) {
  //     case 0:
  //       return <User className="size-3" />; // Jefe
  //     case 1:
  //       return <Users className="size-3" />; // Pares
  //     case 2:
  //       return <UserCheck className="size-3" />; // Subordinados
  //     case 3:
  //       return <Target className="size-3" />; // Autoevaluación
  //     default:
  //       return <User className="size-3" />;
  //   }
  // };

  // Función para obtener el nombre del tipo de evaluador
  // const getEvaluatorTypeName = (type: number) => {
  //   switch (type) {
  //     case 0:
  //       return "Jefe Directo";
  //     case 1:
  //       return "Pares";
  //     case 2:
  //       return "Reportes";
  //     case 3:
  //       return "Autoevaluación";
  //     default:
  //       return "Desconocido";
  //   }
  // };

  // Función para obtener el color del badge de estado
  const getCompletionBadgeVariant = (percentage: number) => {
    if (percentage === 100) return "default";
    if (percentage >= 50) return "tertiary";
    return "outline";
  };

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
          variant={getResultVariant(evaluator?.result || "0.00")}
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
          (e) => e.evaluator_type === 0
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
      { type: 0, name: "Jefe", icon: User },
      { type: 1, name: "Auto", icon: Target },
      { type: 2, name: "Pares", icon: Users },
      { type: 3, name: "Reportes", icon: UserCheck },
    ];

    evaluatorTypes.forEach(({ type, name, icon: Icon }) => {
      if (requiredEvaluatorTypes.includes(type)) {
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
            const evaluator = subCompetence.evaluators?.find(
              (e) => e.evaluator_type === type
            );
            return (
              <div className="flex items-center justify-center">
                <EvaluationCell
                  evaluator={evaluator}
                  readOnly={readOnly}
                  max={competenceMaxScore}
                />
              </div>
            );
          },
        });
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
            variant={getResultVariant(subCompetence.average_result || 0)}
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
            variant={getCompletionBadgeVariant(completionPercentage)}
            className="text-xs"
          >
            {Math.round(completionPercentage)}%
          </Badge>
          {/* <div className="w-full">
            <Progress value={completionPercentage} className="w-full h-1" />
          </div> */}
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
