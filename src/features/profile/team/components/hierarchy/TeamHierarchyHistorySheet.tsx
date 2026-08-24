import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GeneralSheet from "@/shared/components/GeneralSheet";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/shared/components/animateTabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, CheckCircle2, LucideIcon } from "lucide-react";
import { EVALUATION_PERSON } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.constans";
import { useAllEvaluations } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.hook";
import { useActivePerformanceEvaluation } from "@/features/gp/gestionhumana/evaluaciondesempeño/dashboard/lib/performance-evaluation.hook";
import { getEvaluationPersonResultByPersonAndEvaluation } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.actions";
import EvaluationPersonObjectiveTable from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonObjetiveTable";
import EvaluationPersonCompetenceTableWithColumns from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonCompetenceTable";
import EvaluationSelector from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationSelector";
import NoEvaluationMessage from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/NoEvaluationMessage";
import { EVALUATION_OBJECTIVE } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { getScales } from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.hook";
import { cn } from "@/lib/utils";

const { QUERY_KEY } = EVALUATION_PERSON;

// Handlers no-op: esta vista es solo de consulta, nunca de edición/calificación.
const noopUpdate = async () => {};

interface ResultMetricCardProps {
  icon: LucideIcon;
  title: string;
  score: number;
  maxScore: number;
  labelRange: string;
  scaleClass: string;
  completed?: number;
  total?: number;
  completionRate?: number;
}

function ResultMetricCard({
  icon: Icon,
  title,
  score,
  maxScore,
  labelRange,
  scaleClass,
  completed,
  total,
  completionRate,
}: ResultMetricCardProps) {
  return (
    <div className="p-4 bg-muted/30 rounded-lg shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-primary" />
        <span className="text-sm font-semibold">{title}</span>
      </div>

      <div className="flex items-end justify-between flex-wrap gap-2">
        <Badge size="lg" variant="ghost" className={cn("text-lg font-bold", scaleClass)}>
          {score}/{maxScore}
        </Badge>
        <Badge size="sm" variant="ghost" className={cn("text-sm font-semibold", scaleClass)}>
          {labelRange}
        </Badge>
      </div>

      {total !== undefined && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Completados</span>
            <span className="font-medium">
              {completed}/{total}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Avance</span>
            <Badge variant="outline" size="sm" className="text-xs h-5">
              {completionRate}%
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

interface TeamHierarchyHistorySheetProps {
  personId: number | null;
  open: boolean;
  onClose: () => void;
}

export default function TeamHierarchyHistorySheet({
  personId,
  open,
  onClose,
}: TeamHierarchyHistorySheetProps) {
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    number | undefined
  >(undefined);

  const { data: evaluations = [], isLoading: isLoadingEvaluations } =
    useAllEvaluations();
  const { data: activeEvaluation } = useActivePerformanceEvaluation();

  useEffect(() => {
    if (evaluations.length > 0 && !selectedEvaluationId) {
      setSelectedEvaluationId(activeEvaluation?.id ?? evaluations[0].id);
    }
  }, [evaluations, activeEvaluation, selectedEvaluationId]);

  useEffect(() => {
    setSelectedEvaluationId(undefined);
  }, [personId]);

  const {
    data: evaluationPersonResult,
    isLoading: isLoadingEvaluationPerson,
    error: evaluationPersonError,
  } = useQuery({
    queryKey: [QUERY_KEY, "hierarchy-history", personId, selectedEvaluationId],
    queryFn: () =>
      getEvaluationPersonResultByPersonAndEvaluation(
        personId as number,
        selectedEvaluationId,
      ),
    enabled: open && !!personId && !!selectedEvaluationId,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const hasResult = !!evaluationPersonResult && !evaluationPersonError;
  const showObjectivesCard = !!evaluationPersonResult?.hasObjectives;
  const showCompetencesCard =
    !!evaluationPersonResult &&
    evaluationPersonResult.evaluation.typeEvaluation.toString() !==
      EVALUATION_OBJECTIVE.ID;
  const resultCardCount =
    1 + (showObjectivesCard ? 1 : 0) + (showCompetencesCard ? 1 : 0);

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={evaluationPersonResult?.person.name ?? "Historial de evaluación"}
      subtitle={evaluationPersonResult?.person.position}
      icon="History"
      size="5xl"
    >
      <div className="space-y-4">
        <EvaluationSelector
          evaluations={evaluations}
          selectedEvaluationId={selectedEvaluationId}
          onEvaluationChange={setSelectedEvaluationId}
          onRefresh={() => {}}
          isLoadingEvaluations={isLoadingEvaluations}
          isSaving={false}
        />

        {isLoadingEvaluationPerson ? (
          <FormSkeleton />
        ) : !hasResult ? (
          <NoEvaluationMessage
            title="Sin evaluación en este periodo"
            description="Esta persona no tuvo evaluación en el periodo seleccionado."
            showSelector={false}
          />
        ) : (
          <>
            <div
              className={cn(
                "grid grid-cols-1 gap-3",
                resultCardCount === 2 && "sm:grid-cols-2",
                resultCardCount === 3 && "sm:grid-cols-3",
              )}
            >
              <ResultMetricCard
                icon={TrendingUp}
                title="Resultado Final"
                score={evaluationPersonResult.result}
                maxScore={evaluationPersonResult.maxFinalParameter}
                labelRange={evaluationPersonResult.statistics.final.label_range}
                scaleClass={
                  getScales(
                    evaluationPersonResult.finalParameter.details.length,
                  )[evaluationPersonResult.statistics.final.index_range_result]
                }
              />

              {showObjectivesCard && (
                <ResultMetricCard
                  icon={CheckCircle2}
                  title="Objetivos"
                  score={evaluationPersonResult.objectivesResult}
                  maxScore={evaluationPersonResult.statistics.objectives.max_score}
                  labelRange={
                    evaluationPersonResult.statistics.objectives.label_range
                  }
                  scaleClass={
                    getScales(
                      evaluationPersonResult.objectiveParameter.details.length,
                    )[
                      evaluationPersonResult.statistics.objectives
                        .index_range_result
                    ]
                  }
                  completed={
                    evaluationPersonResult.statistics.objectives.completed
                  }
                  total={evaluationPersonResult.statistics.objectives.total}
                  completionRate={
                    evaluationPersonResult.statistics.objectives
                      .completion_rate
                  }
                />
              )}

              {showCompetencesCard && (
                <ResultMetricCard
                  icon={Target}
                  title="Competencias"
                  score={
                    evaluationPersonResult.statistics.competences
                      .average_score
                  }
                  maxScore={
                    evaluationPersonResult.statistics.competences.max_score
                  }
                  labelRange={
                    evaluationPersonResult.statistics.competences.label_range
                  }
                  scaleClass={
                    getScales(
                      evaluationPersonResult.competenceParameter.details
                        .length,
                    )[
                      evaluationPersonResult.statistics.competences
                        .index_range_result
                    ]
                  }
                  completed={
                    evaluationPersonResult.statistics.competences.completed
                  }
                  total={evaluationPersonResult.statistics.competences.total}
                  completionRate={
                    evaluationPersonResult.statistics.competences
                      .completion_rate
                  }
                />
              )}
            </div>

            <Tabs
              defaultValue={
                evaluationPersonResult?.hasObjectives
                  ? "objectives"
                  : "competences"
              }
              className="w-full rounded-lg"
            >
              <TabsList>
                {evaluationPersonResult?.hasObjectives && (
                  <TabsTrigger value="objectives" className="gap-2 px-8">
                    <Target className="size-4" />
                    Objetivos
                    <Badge variant="outline" className="ml-2 text-xs">
                      {evaluationPersonResult.statistics.objectives.completed}
                      /{evaluationPersonResult.statistics.objectives.total}
                    </Badge>
                  </TabsTrigger>
                )}
                {evaluationPersonResult?.evaluation.typeEvaluation.toString() !==
                  EVALUATION_OBJECTIVE.ID && (
                  <TabsTrigger value="competences" className="gap-2 px-8">
                    <TrendingUp className="size-4" />
                    Competencias
                    <Badge variant="outline" className="ml-2 text-xs">
                      {evaluationPersonResult.statistics.competences.completed}
                      /{evaluationPersonResult.statistics.competences.total}
                    </Badge>
                  </TabsTrigger>
                )}
              </TabsList>
              <TabsContents className="rounded-sm bg-background w-full">
                <TabsContent value="objectives" className="space-y-6">
                  <EvaluationPersonObjectiveTable
                    evaluationPersonResult={evaluationPersonResult}
                    details={evaluationPersonResult?.details}
                    onUpdateCell={noopUpdate}
                    readOnly
                  />
                </TabsContent>
                <TabsContent value="competences" className="space-y-6">
                  <EvaluationPersonCompetenceTableWithColumns
                    evaluationPersonResult={evaluationPersonResult}
                    competenceGroups={evaluationPersonResult?.competenceGroups}
                    onUpdateCell={noopUpdate}
                    showProgress
                    readOnly
                  />
                </TabsContent>
              </TabsContents>
            </Tabs>
          </>
        )}
      </div>
    </GeneralSheet>
  );
}
