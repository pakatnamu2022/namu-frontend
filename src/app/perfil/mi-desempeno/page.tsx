"use client";

import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/shared/components/animateTabs";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target } from "lucide-react";
import { EVALUATION_PERSON } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.constans";
import { useAllEvaluations } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.hook";
import {
  updateEvaluationPerson,
  updateEvaluationPersonCompetence,
  getEvaluationPersonResultByPersonAndEvaluation,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.actions";
import EvaluationSummaryCard from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationSummaryCard";
import EvaluationPersonObjectiveTable from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonObjetiveTable";
import EvaluationPersonCompetenceTableWithColumns from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonCompetenceTable";
import EvaluationSelector from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationSelector";
import NoEvaluationMessage from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/NoEvaluationMessage";
import PersonTitleComponent from "@/shared/components/PersonTitleComponent";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { EVALUATION_OBJECTIVE } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";
import PageWrapper from "@/shared/components/PageWrapper";

const { QUERY_KEY, MODEL } = EVALUATION_PERSON;

export default function MyPerformance() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    number | undefined
  >();
  const [saving, setSaving] = useState(false);

  const {
    data: evaluationPersonResult,
    isLoading: isLoadingEvaluationPerson,
    refetch: refetchEvaluationResult,
    error: evaluationPersonError,
  } = useQuery({
    queryKey: [QUERY_KEY, user.partner_id, selectedEvaluationId],
    queryFn: () =>
      getEvaluationPersonResultByPersonAndEvaluation(
        user.partner_id,
        selectedEvaluationId
      ),
    enabled: !!selectedEvaluationId && !!user.partner_id,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: evaluations = [], isLoading: isLoadingEvaluations } =
    useAllEvaluations();

  useEffect(() => {
    // setear la evaluación activa al cargar las evaluaciones
    if (evaluations.length > 0 && !selectedEvaluationId) {
      setSelectedEvaluationId(evaluations[0].id);
    }
  }, [evaluations, selectedEvaluationId]);

  const invalidateQuery = async () => {
    await queryClient.invalidateQueries({
      queryKey: [QUERY_KEY],
    });
  };

  const handleUpdateResultCell = async (id: number, result: number) => {
    try {
      setSaving(true);
      await updateEvaluationPerson(id, { result });
      await Promise.all([invalidateQuery(), refetchEvaluationResult()]);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || ERROR_MESSAGE(MODEL, "update")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateResultCellCompetence = async (
    id: number,
    result: number
  ) => {
    try {
      setSaving(true);
      await updateEvaluationPersonCompetence(id, { result });
      await Promise.all([invalidateQuery(), refetchEvaluationResult()]);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || ERROR_MESSAGE(MODEL, "update")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setSaving(true);
      await refetchEvaluationResult();
      successToast("Datos actualizados correctamente");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al actualizar los datos"
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingEvaluations) return <FormSkeleton />;

  // Si no hay resultado de evaluación para esta persona
  if (
    !isLoadingEvaluationPerson &&
    (!evaluationPersonResult || evaluationPersonError) &&
    selectedEvaluationId
  ) {
    const selectedEvaluation = evaluations.find(
      (evaluation) => evaluation.id === selectedEvaluationId
    );
    return (
      <NoEvaluationMessage
        title="Sin evaluación en este periodo"
        description={`No tienes evaluación en el periodo ${
          selectedEvaluation
            ? `"${selectedEvaluation.name}"`
            : "seleccionado"
        }.`}
        evaluations={evaluations}
        selectedEvaluationId={selectedEvaluationId}
        onEvaluationChange={setSelectedEvaluationId}
        isLoadingEvaluations={isLoadingEvaluations}
      />
    );
  }

  if (!evaluationPersonResult) return <FormSkeleton />;

  return (
    <PageWrapper>
      <div className="space-y-4 p-0">
        {/* Header principal */}
        <PersonTitleComponent
          name={user.name}
          position={user.position}
          photo={user.foto_adjunto}
        >
          <div className="ml-auto text-right">
            <div className="text-2xl font-bold text-primary">
              {evaluationPersonResult.statistics.overall_completion_rate}%
            </div>
            <div className="text-xs text-muted-foreground">
              Progreso general
            </div>
          </div>
        </PersonTitleComponent>

        {/* Selector de evaluación y controles */}
        <EvaluationSelector
          evaluations={evaluations}
          selectedEvaluationId={selectedEvaluationId}
          onEvaluationChange={setSelectedEvaluationId}
          onRefresh={handleRefresh}
          isLoadingEvaluations={isLoadingEvaluations}
          isSaving={saving}
        />
      </div>

      <div className="mt-6 space-y-4 grid grid-cols-4 gap-6">
        {/* Tabs de contenido */}
        <Tabs
          defaultValue={
            evaluationPersonResult?.hasObjectives ? "objectives" : "competences"
          }
          className="p-2 w-full bg-muted rounded-lg col-span-3"
        >
          <TabsList className="grid w-full grid-cols-2">
            {evaluationPersonResult?.hasObjectives && (
              <TabsTrigger value="objectives" className="gap-2">
                <Target className="size-4" />
                Objetivos
                <Badge variant="outline" className="ml-2 text-xs">
                  {evaluationPersonResult.statistics.objectives.completed}/
                  {evaluationPersonResult.statistics.objectives.total}
                </Badge>
              </TabsTrigger>
            )}
            {evaluationPersonResult?.evaluation.typeEvaluation.toString() !==
              EVALUATION_OBJECTIVE.ID && (
              <TabsTrigger value="competences" className="gap-2">
                <TrendingUp className="size-4" />
                Competencias
                <Badge variant="outline" className="ml-2 text-xs">
                  {evaluationPersonResult.statistics.competences.completed}/
                  {evaluationPersonResult.statistics.competences.total}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContents className="rounded-sm bg-background w-full">
            <TabsContent value="objectives" className="space-y-6 p-6">
              {isLoadingEvaluationPerson ? (
                <FormSkeleton />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Evaluación de Objetivos
                    </h3>
                    {evaluationPersonResult?.objectivesPercentage && (
                      <Badge variant="outline">
                        Peso: {evaluationPersonResult.objectivesPercentage}% del
                        total
                      </Badge>
                    )}
                  </div>
                  <EvaluationPersonObjectiveTable
                    evaluationPersonResult={evaluationPersonResult}
                    details={evaluationPersonResult?.details}
                    onUpdateCell={handleUpdateResultCell}
                    readOnly={true}
                  />
                </>
              )}
            </TabsContent>
            <TabsContent value="competences" className="space-y-6 p-6">
              {isLoadingEvaluationPerson ? (
                <FormSkeleton />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Evaluación de Competencias
                    </h3>
                    <div className="flex items-center gap-2">
                      {evaluationPersonResult?.competencesPercentage && (
                        <Badge variant="outline">
                          Peso: {evaluationPersonResult.competencesPercentage}%
                          del total
                        </Badge>
                      )}
                      {evaluationPersonResult?.evaluation
                        ?.typeEvaluationName && (
                        <Badge variant="secondary">
                          {evaluationPersonResult.evaluation.typeEvaluationName}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <EvaluationPersonCompetenceTableWithColumns
                    evaluationPersonResult={evaluationPersonResult}
                    competenceGroups={evaluationPersonResult?.competenceGroups}
                    onUpdateCell={handleUpdateResultCellCompetence}
                    readOnly={true}
                    showProgress={true}
                  />
                </>
              )}
            </TabsContent>
          </TabsContents>
        </Tabs>

        {/* Resumen de estadísticas */}
        {!isLoadingEvaluationPerson && evaluationPersonResult && (
          <EvaluationSummaryCard evaluationResult={evaluationPersonResult} />
        )}
      </div>
    </PageWrapper>
  );
}
