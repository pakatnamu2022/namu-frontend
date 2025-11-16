"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  CompetenceGroup,
  EvaluationPersonResultResource,
} from "../lib/evaluationPerson.interface";
import { evaluationPersonCompetenceColumns } from "./EvaluationPersonCompetenceColumns";
import { DataTable } from "@/shared/components/DataTable";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  competenceGroups?: CompetenceGroup[];
  onUpdateCell: (id: number, value: number) => void;
  readOnly?: boolean;
  showProgress?: boolean;
  isLoading?: boolean;
  evaluationPersonResult?: EvaluationPersonResultResource;
}

export default function EvaluationPersonCompetenceTableWithColumns({
  competenceGroups = [],
  onUpdateCell,
  readOnly = false,
  showProgress = true,
  isLoading = false,
  evaluationPersonResult,
}: Props) {
  // Estado para controlar qué competencias están expandidas
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  // Función para alternar la expansión de un grupo
  const toggleGroup = (competenceId: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(competenceId)) {
      newExpanded.delete(competenceId);
    } else {
      newExpanded.add(competenceId);
    }
    setExpandedGroups(newExpanded);
  };

  // Calcular estadísticas generales
  const totalSubCompetences = competenceGroups.reduce(
    (sum, group) => sum + (group.sub_competences?.length || 0),
    0
  );

  const completedSubCompetences = competenceGroups.reduce(
    (sum, group) => sum + (group.completed_evaluations || 0),
    0
  );

  const averageResult =
    competenceGroups.length > 0
      ? competenceGroups.reduce((sum, group) => sum + group.average_result, 0) /
        competenceGroups.length
      : 0;

  // Función para obtener el color del badge de cumplimiento
  const getComplianceBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return "default";
    if (percentage >= 70) return "tertiary";
    if (percentage >= 50) return "outline";
    return "secondary";
  };

  if (!competenceGroups || competenceGroups.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Target className="size-12" />
          <div>
            <h3 className="font-medium">No se encontraron competencias</h3>
            <p className="text-sm">
              No hay competencias asignadas para esta evaluación.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas generales */}
      <div className="bg-muted/50 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="size-5 text-primary" />
            <div>
              <h3 className="font-semibold text-lg">
                Evaluación de Competencias
              </h3>
              <p className="text-sm text-muted-foreground">
                Evaluación{" "}
                {competenceGroups[0]?.evaluation_type === 1 ? "180°" : "360°"} -
                {competenceGroups.length} competencia
                {competenceGroups.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {showProgress && (
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {averageResult.toFixed(1)}/
                    {evaluationPersonResult?.maxCompetenceParameter}
                  </span>
                </div>
                <Progress
                  value={
                    (averageResult /
                      (evaluationPersonResult?.maxCompetenceParameter || 5)) *
                    100
                  }
                  className="w-24 h-2"
                />
              </div>
            )}

            <div className="text-right text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="size-3" />
                {completedSubCompetences}/{totalSubCompetences}
              </div>
              <span>Completadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grupos de competencias */}
      <div className="space-y-4">
        {competenceGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.competence_id);

          // Crear las columnas específicas para este grupo
          const columns = evaluationPersonCompetenceColumns({
            onUpdateCell,
            readOnly,
            evaluationType: group.evaluation_type,
            requiredEvaluatorTypes: group.required_evaluator_types,
            competenceMaxScore:
              evaluationPersonResult?.maxCompetenceParameter || 5,
          });

          return (
            <div
              key={group.competence_id}
              className="rounded-lg border overflow-hidden"
            >
              {/* Header de la competencia principal */}
              <div
                className={cn(
                  "bg-muted/50 p-4 border-b cursor-pointer hover:bg-muted/70 transition-colors",
                  !isExpanded && "border-b-0"
                )}
                onClick={() => toggleGroup(group.competence_id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      )}
                      <Target className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {group.competence_name.split(":")[0]}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {group.evaluation_type === 1 ? "180°" : "360°"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {group.competence_description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {showProgress && (
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="size-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {group.average_result.toFixed(1)}/
                            {evaluationPersonResult?.maxCompetenceParameter ||
                              5}
                          </span>
                        </div>
                        <Progress
                          value={
                            (group.average_result /
                              (evaluationPersonResult?.maxCompetenceParameter ||
                                5)) *
                            100
                          }
                          className="w-24 h-2"
                        />
                      </div>
                    )}

                    <div className="text-right text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        {group.completed_evaluations}/
                        {group.total_sub_competences}
                      </div>
                      <span>Completadas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido expandible con tabla de sub-competencias */}
              {isExpanded && (
                <div className="bg-background">
                  <DataTable
                    columns={columns}
                    data={group.sub_competences || []}
                    isLoading={isLoading}
                    isVisibleColumnFilter={false}
                    initialColumnVisibility={{
                      completion_percentage: showProgress,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer con resumen general */}
      <div className="bg-muted/20 p-4 border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center justify-start gap-3">
            <span className="text-muted-foreground">Competencias:</span>
            <span className="font-medium">{competenceGroups.length}</span>
          </div>
          <div className="flex items-center justify-start gap-3">
            <span className="text-muted-foreground">Sub-competencias:</span>
            <span className="font-medium">{totalSubCompetences}</span>
          </div>
          <div className="flex items-center justify-start gap-3">
            <span className="text-muted-foreground">Completadas:</span>
            <span className="font-medium">{completedSubCompetences}</span>
          </div>
          <div className="flex items-center justify-start gap-3">
            <span className="text-muted-foreground">Promedio General:</span>
            <Badge
              variant={getComplianceBadgeVariant(
                (averageResult /
                  (evaluationPersonResult?.maxCompetenceParameter || 5)) *
                  100
              )}
            >
              {averageResult.toFixed(1)}/
              {evaluationPersonResult?.maxCompetenceParameter || 5}
            </Badge>
          </div>
        </div>
      </div>

      {/* Botones de control para expandir/colapsar todo */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() =>
            setExpandedGroups(
              new Set(competenceGroups.map((g) => g.competence_id))
            )
          }
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Expandir todo
        </button>
        <span className="text-xs text-muted-foreground">•</span>
        <button
          onClick={() => setExpandedGroups(new Set())}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Colapsar todo
        </button>
      </div>
    </div>
  );
}
