"use client";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/shared/components/animateTabs";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, RefreshCw, ChevronLeft } from "lucide-react";
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
import EvaluationPersonHeader from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonHeader";
import EvaluationSelector from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationSelector";
import NoEvaluationMessage from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/NoEvaluationMessage";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { EVALUATION_OBJECTIVE } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";
import PageWrapper from "@/shared/components/PageWrapper";

const { QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = EVALUATION_PERSON;

export default function EvaluationDetailPersonPage() {
  const { id, person } = useParams();

  const idEvaluation = Number(id);
  const personId = Number(person);

  const queryClient = useQueryClient();

  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    number | undefined
  >(idEvaluation || undefined);
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
        selectedEvaluationId
      ),
    enabled: !!selectedEvaluationId && !!personId,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: evaluations = [], isLoading: isLoadingEvaluations } =
    useAllEvaluations();

  //   setear la evaluación activa al cargar las evaluaciones
  useEffect(() => {
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
        description={`Esta persona no tuvo evaluación en el periodo ${
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
        <EvaluationPersonHeader
          personName={evaluationPersonResult.person.name}
          personPosition={evaluationPersonResult.person.position}
          personPhoto={evaluationPersonResult.person.photo}
          completionRate={evaluationPersonResult.statistics.overall_completion_rate}
        />

        {/* Selector de evaluación y controles */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {isLoadingEvaluations ? (
            <Skeleton className="h-8 w-80" />
          ) : (
            <SearchableSelect
              options={evaluations.map((evaluation) => ({
                value: evaluation.id.toString(),
                label: () => (
                  <span className="flex items-center gap-2">
                    {evaluation.name}{" "}
                    <Badge variant={"tertiary"} className="text-[10px]">
                      {evaluation.period}
                    </Badge>
                  </span>
                ),
              }))}
              onChange={(value: string) => {
                setSelectedEvaluationId(Number(value));
              }}
              value={selectedEvaluationId?.toString() ?? ""}
              placeholder="Selecciona la Evaluación..."
              className="w-auto! min-w-80"
            />
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={saving}
              className="gap-2"
            >
              <RefreshCw className={`size-4 ${saving ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Link to={`${ABSOLUTE_ROUTE}/${selectedEvaluationId}`}>
              <Button size={"sm"} variant={"tertiary"}>
                <ChevronLeft className="w-4 h-4" />
                Ver Evaluaciones
              </Button>
            </Link>
          </div>
        </div>
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
                    onCommentCell={handleCommentSubmit}
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
                    showProgress={true}
                    canEditAll={true}
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
