"use client";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/shared/components/animateTabs";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, RefreshCw, ChevronLeft } from "lucide-react";
import { EVALUATION_PERSON } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.constans";
import { useActivePerformanceEvaluation } from "@/features/gp/gestionhumana/evaluaciondesempeño/dashboard/lib/performance-evaluation.hook";
import {
  getEvaluationPersonResultByPersonAndEvaluation,
  updateEvaluationPerson,
  updateEvaluationPersonCompetence,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.actions";
import EvaluationSummaryCard from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationSummaryCard";
import EvaluationPersonObjectiveTable from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonObjetiveTable";
import EvaluationPersonCompetenceTableWithColumns from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonCompetenceTable";
import NoEvaluationMessage from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/NoEvaluationMessage";
import PersonTitleComponent from "@/shared/components/PersonTitleComponent";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { EVALUATION_OBJECTIVE } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import PageWrapper from "@/shared/components/PageWrapper";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  getProgressBackgroundColor,
  getProgressColor,
  getVariantByCompletionRate,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.function";

const { QUERY_KEY, MODEL } = EVALUATION_PERSON;

export default function NamuPerformanceEvaluationPage() {
  const { id } = useParams();
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  const personId = Number(id);
  const [saving, setSaving] = useState(false);

  // Obtener la evaluación activa
  const { data: activeEvaluation, isLoading: isLoadingActiveEvaluation } =
    useActivePerformanceEvaluation();

  const {
    data: evaluationPersonResult,
    isLoading: isLoadingEvaluationPerson,
    refetch: refetchEvaluationResult,
    error: evaluationPersonError,
  } = useQuery({
    queryKey: [QUERY_KEY, personId, activeEvaluation?.id],
    queryFn: () =>
      getEvaluationPersonResultByPersonAndEvaluation(
        personId,
        activeEvaluation?.id
      ),
    enabled: !!activeEvaluation?.id && !!personId,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const queryClient = useQueryClient();

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

  const handleCommentSubmit = async (id: number, comment: string) => {
    try {
      setSaving(true);
      await updateEvaluationPerson(id, { comment });
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

  const handleBack = () => {
    const page = searchParams.get("page") || "1";
    const search = searchParams.get("search") || "";
    const per_page = searchParams.get("per_page") || "";

    const params = new URLSearchParams();
    if (page !== "1") params.set("page", page);
    if (search) params.set("search", search);
    if (per_page) params.set("per_page", per_page);

    const queryString = params.toString();
    router(`/perfil/equipo${queryString ? `?${queryString}` : ""}`);
  };

  if (isLoadingActiveEvaluation) return <FormSkeleton />;

  if (!activeEvaluation) {
    return (
      <NoEvaluationMessage
        title="No hay evaluación activa"
        description="No se encontró una evaluación activa para evaluar en este momento."
        showSelector={false}
        actions={
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Volver al Equipo
          </Button>
        }
      />
    );
  }

  // Si no hay resultado de evaluación para esta persona
  if (
    !isLoadingEvaluationPerson &&
    (!evaluationPersonResult || evaluationPersonError)
  ) {
    return (
      <NoEvaluationMessage
        title="Sin evaluación en este periodo"
        description="Esta persona no tiene evaluación activa para evaluar."
        showSelector={false}
        actions={
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Volver al Equipo
          </Button>
        }
      />
    );
  }

  if (!evaluationPersonResult) return <FormSkeleton />;

  return (
    <PageWrapper>
      <div className="p-0">
        {/* Header principal */}
        <PersonTitleComponent
          name={evaluationPersonResult.person.name}
          position={evaluationPersonResult.person.position}
          photo={evaluationPersonResult.person.photo}
          backButtonRoute="/perfil/equipo"
          backButtonName="Ver Equipo"
        >
          <div className="flex gap-2 items-end">
            <div className="flex flex-col gap-2 items-center">
              <div className="flex flex-wrap items-center gap-2">
                <Badge color="indigo" className="text-xs">
                  {activeEvaluation.name}
                </Badge>
                <Badge color="sky" className="text-xs">
                  {activeEvaluation.period}
                </Badge>
                <Badge color="blue" className="text-xs">
                  Activa
                </Badge>
                <Badge
                  variant={getVariantByCompletionRate(
                    evaluationPersonResult.statistics.overall_completion_rate
                  )}
                  className="text-xs"
                >
                  {evaluationPersonResult.statistics.overall_completion_rate}%
                </Badge>
              </div>
              <Progress
                value={
                  evaluationPersonResult.statistics.overall_completion_rate
                }
                className={cn(
                  "h-2",
                  getProgressBackgroundColor(
                    evaluationPersonResult.statistics.overall_completion_rate
                  )
                )}
                indicatorClassName={getProgressColor(
                  evaluationPersonResult.statistics.overall_completion_rate
                )}
              />
            </div>
            <Button
              variant="default"
              size="icon-lg"
              onClick={handleRefresh}
              disabled={saving}
              className="gap-2"
            >
              <RefreshCw className={`size-4 ${saving ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </PersonTitleComponent>

        {/* Evaluación activa y controles */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2"></div>
        </div>
      </div>

      <div className="space-y-4 grid grid-cols-4 gap-6">
        {/* Tabs de contenido */}
        <Tabs
          defaultValue={
            evaluationPersonResult?.hasObjectives ? "objectives" : "competences"
          }
          className="w-full rounded-lg col-span-3"
        >
          <TabsList>
            {evaluationPersonResult?.hasObjectives && (
              <TabsTrigger value="objectives" className="gap-2 px-8">
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
              <TabsTrigger value="competences" className="gap-2 px-8">
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
            <TabsContent value="objectives" className="space-y-6">
              {isLoadingEvaluationPerson ? (
                <FormSkeleton />
              ) : (
                <EvaluationPersonObjectiveTable
                  evaluationPersonResult={evaluationPersonResult}
                  details={evaluationPersonResult?.details}
                  onUpdateCell={handleUpdateResultCell}
                  onCommentCell={handleCommentSubmit}
                  readOnly={
                    evaluationPersonResult.details[0].chief_id !==
                    user.partner_id
                  }
                />
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
                        <Badge color="secondary">
                          {evaluationPersonResult.evaluation.typeEvaluationName}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <EvaluationPersonCompetenceTableWithColumns
                    evaluationPersonResult={evaluationPersonResult}
                    competenceGroups={evaluationPersonResult?.competenceGroups}
                    onUpdateCell={handleUpdateResultCellCompetence}
                    showProgress={true}
                    readOnly={false}
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
