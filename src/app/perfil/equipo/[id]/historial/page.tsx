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
import { TrendingUp, Target, ChevronLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVALUATION_PERSON } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.constans";
import { useAllEvaluations } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.hook";
import { useActivePerformanceEvaluation } from "@/features/gp/gestionhumana/evaluaciondesempeño/dashboard/lib/performance-evaluation.hook";
import {
  updateEvaluationPerson,
  updateEvaluationPersonCompetence,
  getEvaluationPersonResultByPersonAndEvaluation,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.actions";
import EvaluationSummaryCard from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationSummaryCard";
import EvaluationPersonObjectiveTable from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonObjetiveTable";
import EvaluationPersonCompetenceTableWithColumns from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonCompetenceTable";
import NoEvaluationMessage from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/NoEvaluationMessage";
import PersonTitleComponent from "@/shared/components/PersonTitleComponent";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EVALUATION_OBJECTIVE } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";
import PageWrapper from "@/shared/components/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import {
  getProgressBackgroundColor,
  getProgressColor,
  getProgressColorBadge,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.function";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const { QUERY_KEY, MODEL } = EVALUATION_PERSON;

export default function NamuPerformanceHistoryPage() {
  const { id } = useParams();
  const router = useNavigate();
  const [searchParams] = useSearchParams();

  const personId = Number(id);
  const queryClient = useQueryClient();

  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    number | undefined
  >(undefined);
  const [saving, setSaving] = useState(false);

  const {
    data: evaluationPersonResult,
    isLoading: isLoadingEvaluationPerson,
    refetch: refetchEvaluationResult,
    error: evaluationPersonError,
  } = useQuery({
    queryKey: [QUERY_KEY, personId, selectedEvaluationId],
    queryFn: () =>
      getEvaluationPersonResultByPersonAndEvaluation(
        personId,
        selectedEvaluationId,
      ),
    enabled: !!selectedEvaluationId && !!personId,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: evaluations = [], isLoading: isLoadingEvaluations } =
    useAllEvaluations();

  const { data: activeEvaluation, isLoading: isLoadingActiveEvaluation } =
    useActivePerformanceEvaluation();

  // Setear la evaluación: primero la primera disponible, luego la activa cuando se cargue
  useEffect(() => {
    if (evaluations.length > 0 && !selectedEvaluationId) {
      setSelectedEvaluationId(evaluations[0].id);
    }
  }, [evaluations, selectedEvaluationId]);

  // Cuando se carga la evaluación activa, cambiar a esa
  useEffect(() => {
    if (activeEvaluation && evaluations.length > 0) {
      setSelectedEvaluationId(activeEvaluation.id);
    }
  }, [activeEvaluation, evaluations]);

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
        error?.response?.data?.message || ERROR_MESSAGE(MODEL, "update"),
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
        error?.response?.data?.message || ERROR_MESSAGE(MODEL, "update"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateResultCellCompetence = async (
    id: number,
    result: number,
  ) => {
    try {
      setSaving(true);
      await updateEvaluationPersonCompetence(id, { result });
      await Promise.all([invalidateQuery(), refetchEvaluationResult()]);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || ERROR_MESSAGE(MODEL, "update"),
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
        error?.response?.data?.message || "Error al actualizar los datos",
      );
    } finally {
      setSaving(false);
    }
  };

  const getBackRoute = () => {
    const page = searchParams.get("page") || "1";
    const search = searchParams.get("search") || "";
    const per_page = searchParams.get("per_page") || "";

    const params = new URLSearchParams();
    if (page !== "1") params.set("page", page);
    if (search) params.set("search", search);
    if (per_page) params.set("per_page", per_page);

    const queryString = params.toString();
    return `/perfil/equipo${queryString ? `?${queryString}` : ""}`;
  };

  if (isLoadingEvaluations || isLoadingActiveEvaluation)
    return <FormSkeleton />;

  // Si no hay resultado de evaluación para esta persona
  if (
    !isLoadingEvaluationPerson &&
    (!evaluationPersonResult || evaluationPersonError) &&
    selectedEvaluationId
  ) {
    const selectedEvaluation = evaluations.find(
      (evaluation) => evaluation.id === selectedEvaluationId,
    );
    return (
      <NoEvaluationMessage
        title="Sin evaluación en este periodo"
        description={`Esta persona no tuvo evaluación en el periodo ${
          selectedEvaluation ? `"${selectedEvaluation.name}"` : "seleccionado"
        }.`}
        evaluations={evaluations}
        selectedEvaluationId={selectedEvaluationId}
        onEvaluationChange={setSelectedEvaluationId}
        isLoadingEvaluations={isLoadingEvaluations}
        actions={
          <Button
            variant="outline"
            onClick={() => router(getBackRoute())}
            className="gap-2"
          >
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
      <div className="space-y-4 p-0">
        {/* Header principal */}
        <PersonTitleComponent
          name={evaluationPersonResult.person.name}
          position={evaluationPersonResult.person.position}
          photo={evaluationPersonResult.person.photo}
          backButtonRoute={getBackRoute()}
          backButtonName="Ver Equipo"
        >
          <div className="flex gap-2 items-end">
            <div className="flex flex-col gap-2 items-center">
              <div className="flex flex-wrap items-center gap-2">
                {isLoadingEvaluations ? (
                  <Skeleton className="h-8 w-80" />
                ) : (
                  <SearchableSelect
                    options={evaluations.map((evaluation) => ({
                      value: evaluation.id.toString(),
                      label: () => (
                        <div className="flex items-center flex-wrap gap-2">
                          <Badge color="indigo">{evaluation.name}</Badge>
                          <Badge color="sky">{evaluation.period}</Badge>
                        </div>
                      ),
                      searchValue: `${evaluation.name} ${evaluation.period}`,
                    }))}
                    onChange={(value: string) => {
                      setSelectedEvaluationId(Number(value));
                    }}
                    value={selectedEvaluationId?.toString() ?? ""}
                    placeholder="Selecciona la Evaluación..."
                    className="w-auto! min-w-80 text-xs! py-0.5! px-0! h-fit! bg-background border-0!"
                  />
                )}
                <Badge color="blue" className="text-xs">
                  Activa
                </Badge>
                <Badge
                  color={getProgressColorBadge(
                    evaluationPersonResult.statistics.overall_completion_rate,
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
                    evaluationPersonResult.statistics.overall_completion_rate,
                  ),
                )}
                indicatorClassName={getProgressColor(
                  evaluationPersonResult.statistics.overall_completion_rate,
                )}
              />
            </div>
          </div>
        </PersonTitleComponent>
      </div>

      <div className="space-y-4 grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  readOnly={activeEvaluation?.id !== selectedEvaluationId}
                />
              )}
            </TabsContent>
            <TabsContent value="competences" className="space-y-6 p-6">
              {isLoadingEvaluationPerson ? (
                <FormSkeleton />
              ) : (
                <EvaluationPersonCompetenceTableWithColumns
                  evaluationPersonResult={evaluationPersonResult}
                  competenceGroups={evaluationPersonResult?.competenceGroups}
                  onUpdateCell={handleUpdateResultCellCompetence}
                  showProgress={true}
                  readOnly={activeEvaluation?.id !== selectedEvaluationId}
                />
              )}
            </TabsContent>
          </TabsContents>
        </Tabs>

        <div className="flex flex-col gap-4 items-end">
          <Button
            variant="outline"
            color="primary"
            size="sm"
            onClick={() => router(`/perfil/equipo/${personId}/plan-desarrollo`)}
            className="gap-2 w-fit"
          >
            <FileText className="size-4" />
            Plan de Desarrollo
          </Button>
          {/* Resumen de estadísticas */}
          {!isLoadingEvaluationPerson && evaluationPersonResult && (
            <EvaluationSummaryCard
              evaluationResult={evaluationPersonResult}
              isSaving={saving}
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
