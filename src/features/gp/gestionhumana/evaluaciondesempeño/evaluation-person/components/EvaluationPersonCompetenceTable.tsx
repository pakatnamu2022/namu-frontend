"use client";

import { Badge } from "@/components/ui/badge";
import {
  Target,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  CompetenceGroup,
  EvaluationPersonResultResource,
} from "../lib/evaluationPerson.interface";
import { evaluationPersonCompetenceColumns } from "./EvaluationPersonCompetenceColumns";
import { DataTable } from "@/shared/components/DataTable";
import { useState, useRef, useReducer } from "react";
import { cn } from "@/lib/utils";
import { getResultRateColorBadge } from "../lib/evaluationPerson.function";
import EvaluationSectionHeader from "./EvaluationSectionHeader";

interface Props {
  competenceGroups?: CompetenceGroup[];
  onUpdateCell: (id: number, value: number) => Promise<void>;
  readOnly?: boolean;
  showProgress?: boolean;
  isLoading?: boolean;
  evaluationPersonResult?: EvaluationPersonResultResource;
  canEditAll?: boolean;
}

export default function EvaluationPersonCompetenceTableWithColumns({
  competenceGroups = [],
  onUpdateCell,
  readOnly = false,
  showProgress = true,
  isLoading = false,
  evaluationPersonResult,
  canEditAll = false,
}: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const optimisticRef = useRef<Record<number, number>>({});
  const statusRef = useRef<Record<number, "loading" | "success">>({});
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const handleCellUpdate = async (id: number, value: number) => {
    const prev = optimisticRef.current[id];
    optimisticRef.current[id] = value;
    statusRef.current[id] = "loading";
    forceUpdate();
    try {
      await onUpdateCell(id, value);
      statusRef.current[id] = "success";
      forceUpdate();
      setTimeout(() => {
        delete statusRef.current[id];
        forceUpdate();
      }, 1500);
    } catch {
      if (prev === undefined) {
        delete optimisticRef.current[id];
      } else {
        optimisticRef.current[id] = prev;
      }
      delete statusRef.current[id];
      forceUpdate();
    }
  };

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
    0,
  );

  const completedSubCompetences = competenceGroups.reduce(
    (sum, group) => sum + (group.completed_evaluations || 0),
    0,
  );

  const averageResult =
    competenceGroups.length > 0
      ? competenceGroups.reduce((sum, group) => sum + group.average_result, 0) /
        competenceGroups.length
      : 0;

  // Función para obtener el color del badge de cumplimiento

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
    <div className="space-y-3">
      {/* Header con estadísticas generales */}
      <EvaluationSectionHeader
        title="Evaluación de Competencias"
        subtitle={`Evaluación ${competenceGroups[0]?.evaluation_type === 1 ? "180°" : "360°"} · ${competenceGroups.length} competencia${competenceGroups.length !== 1 ? "s" : ""}`}
        showProgress={showProgress}
        stats={[
          {
            value: `${averageResult.toFixed(1)} / ${evaluationPersonResult?.maxCompetenceParameter ?? 5}`,
            label: "Promedio",
            progress:
              (averageResult /
                (evaluationPersonResult?.maxCompetenceParameter || 5)) *
              100,
          },
          {
            value: `${completedSubCompetences} / ${totalSubCompetences}`,
            label: "Completadas",
            progress: totalSubCompetences > 0 ? (completedSubCompetences / totalSubCompetences) * 100 : 0,
          },
        ]}
      />

      {/* Grupos de competencias */}
      <div className="space-y-2">
        {competenceGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.competence_id);

          // Crear las columnas específicas para este grupo
          const columns = evaluationPersonCompetenceColumns({
            onUpdateCell: handleCellUpdate,
            optimisticValues: optimisticRef.current,
            cellStatus: statusRef.current,
            readOnly,
            evaluationType: group.evaluation_type,
            requiredEvaluatorTypes: group.required_evaluator_types,
            competenceMaxScore:
              evaluationPersonResult?.maxCompetenceParameter || 5,
            canEditAll,
          });

          return (
            <div
              key={group.competence_id}
              className="rounded-lg border overflow-hidden"
            >
              {/* Header de la competencia principal */}
              <div
                className={cn(
                  "bg-muted/50 px-3 py-2 border-b cursor-pointer hover:bg-muted/70 transition-colors",
                  !isExpanded && "border-b-0",
                )}
                onClick={() => toggleGroup(group.competence_id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                    )}
                    <Target className="size-3.5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-sm truncate">
                          {group.competence_name.split(":")[0]}
                        </h3>
                        <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
                          {group.evaluation_type === 1 ? "180°" : "360°"}
                        </Badge>
                      </div>
                      {group.competence_description && (
                        <p className={cn("text-xs text-muted-foreground", !isExpanded && "truncate")}>
                          {group.competence_description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {showProgress && (
                      <Badge
                        color={getResultRateColorBadge((group.average_result / (evaluationPersonResult?.maxCompetenceParameter || 5)) * 100)}
                        className="tabular-nums text-xs"
                      >
                        {group.average_result.toFixed(1)}/{evaluationPersonResult?.maxCompetenceParameter || 5}
                      </Badge>
                    )}
                    <Badge
                      color={getResultRateColorBadge(group.total_sub_competences > 0 ? (group.completed_evaluations / group.total_sub_competences) * 100 : 0)}
                      className="tabular-nums text-xs"
                    >
                      {group.total_sub_competences > 0 ? Math.round((group.completed_evaluations / group.total_sub_competences) * 100) : 0}%
                    </Badge>
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
      <div className="bg-muted/20 px-3 py-2 border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
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
              color={getResultRateColorBadge(
                (averageResult /
                  (evaluationPersonResult?.maxCompetenceParameter || 5)) *
                  100,
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
              new Set(competenceGroups.map((g) => g.competence_id)),
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
