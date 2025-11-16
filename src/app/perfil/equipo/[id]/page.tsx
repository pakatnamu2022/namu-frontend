"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Calendar, RefreshCw } from "lucide-react";
import { EVALUATION_PERSON } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.constans";
import { useAllEvaluations } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.hook";
import { useActivePerformanceEvaluation } from "@/features/gp/gestionhumana/evaluaciondesempeño/dashboard/lib/performance-evaluation.hook";
import {
  updateEvaluationPerson,
  updateEvaluationPersonCompetence,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.actions";
import EvaluationSummaryCard from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationSummaryCard";
import EvaluationPersonObjectiveTable from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonObjetiveTable";
import EvaluationPersonCompetenceTableWithColumns from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonCompetenceTable";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useParams } from 'react-router-dom';
import { EVALUATION_OBJECTIVE } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";

const { QUERY_KEY, MODEL } = EVALUATION_PERSON;

export default function NamuPerformancePage() {
  const { id } = useParams();

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
      import(
        "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.actions"
      ).then((m) =>
        m.getEvaluationPersonResultByPersonAndEvaluation(
          personId,
          selectedEvaluationId
        )
      ),
    enabled: !!selectedEvaluationId && !!personId,
    refetchOnWindowFocus: false,
    retry: false, // No reintentar en caso de error
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

  if (isLoadingEvaluations || isLoadingActiveEvaluation)
    return <FormSkeleton />;

  // Si no hay resultado de evaluación para esta persona, mostrar mensaje
  if (
    !isLoadingEvaluationPerson &&
    (!evaluationPersonResult || evaluationPersonError) &&
    selectedEvaluationId
  ) {
    const selectedEvaluation = evaluations.find(
      (evaluation) => evaluation.id === selectedEvaluationId
    );
    return (
      <div className="w-full">
        <Card className="border-none shadow-none">
          <CardContent className="mx-auto max-w-7xl">
            <CardHeader className="space-y-4 p-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    Sin evaluación en este periodo
                  </CardTitle>
                  <CardDescription>
                    Esta persona no tuvo evaluación en el periodo{" "}
                    {selectedEvaluation
                      ? `"${selectedEvaluation.name}"`
                      : "seleccionado"}
                    .
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
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
                            {/* {activeEvaluation?.id === evaluation.id && (
                              <Badge
                                variant={"default"}
                                className="text-[10px]"
                              >
                                Activa
                              </Badge>
                            )} */}
                          </span>
                        ),
                      }))}
                      onChange={(value: string) => {
                        setSelectedEvaluationId(Number(value));
                      }}
                      value={selectedEvaluationId?.toString() ?? ""}
                      placeholder="Selecciona la Evaluación..."
                      className="!w-80"
                    />
                  )}
                </div>
              </div>
            </CardHeader>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!evaluationPersonResult) return <FormSkeleton />;

  return (
    <div className="w-full">
      <Card className="border-none shadow-none">
        <CardContent className="mx-auto max-w-7xl">
          <CardHeader className="space-y-4 p-0">
            {/* Header principal */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={evaluationPersonResult.person.photo}
                  alt={evaluationPersonResult.person.name}
                />
                <AvatarFallback className="bg-primary text-white text-lg">
                  {evaluationPersonResult.person.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl capitalize">
                  {evaluationPersonResult.person.name.toLowerCase()}
                </CardTitle>
                <CardDescription className="capitalize text-base">
                  {evaluationPersonResult.person.position.toLowerCase()}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {evaluationPersonResult.statistics.overall_completion_rate}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Progreso general
                </div>
              </div>
            </div>

            {/* Selector de evaluación y controles */}
            <div className="flex items-center justify-between gap-4">
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
                        {/* {activeEvaluation?.id === evaluation.id && (
                          <Badge variant={"default"} className="text-[10px]">
                            Activa
                          </Badge>
                        )} */}
                      </span>
                    ),
                  }))}
                  onChange={(value: string) => {
                    setSelectedEvaluationId(Number(value));
                  }}
                  value={selectedEvaluationId?.toString() ?? ""}
                  placeholder="Selecciona la Evaluación..."
                  className="!w-80"
                />
              )}

              <div className="flex items-center gap-2">
                {saving && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    Actualizando...
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={saving}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`size-4 ${saving ? "animate-spin" : ""}`}
                  />
                  Actualizar
                </Button>
              </div>
            </div>
          </CardHeader>

          <div className="mt-6 space-y-4">
            {/* Resumen de estadísticas */}
            {!isLoadingEvaluationPerson && evaluationPersonResult && (
              <EvaluationSummaryCard
                evaluationResult={evaluationPersonResult}
              />
            )}

            {/* Tabs de contenido */}
            <Tabs
              defaultValue={
                evaluationPersonResult?.hasObjectives
                  ? "objectives"
                  : "competences"
              }
              className="p-2 w-full bg-muted rounded-lg"
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
                            Peso: {evaluationPersonResult.objectivesPercentage}%
                            del total
                          </Badge>
                        )}
                      </div>
                      <EvaluationPersonObjectiveTable
                        evaluationPersonResult={evaluationPersonResult}
                        details={evaluationPersonResult?.details}
                        onUpdateCell={handleUpdateResultCell}
                        onCommentCell={handleCommentSubmit}
                        readOnly={activeEvaluation?.id !== selectedEvaluationId}
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
                              Peso:{" "}
                              {evaluationPersonResult.competencesPercentage}%
                              del total
                            </Badge>
                          )}
                          {evaluationPersonResult?.evaluation
                            ?.typeEvaluationName && (
                            <Badge variant="secondary">
                              {
                                evaluationPersonResult.evaluation
                                  .typeEvaluationName
                              }
                            </Badge>
                          )}
                        </div>
                      </div>
                      <EvaluationPersonCompetenceTableWithColumns
                        evaluationPersonResult={evaluationPersonResult}
                        competenceGroups={
                          evaluationPersonResult?.competenceGroups
                        }
                        onUpdateCell={handleUpdateResultCellCompetence}
                        showProgress={true}
                        readOnly={activeEvaluation?.id !== selectedEvaluationId}
                      />
                    </>
                  )}
                </TabsContent>
              </TabsContents>
            </Tabs>

            {/* Footer con acciones */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {evaluationPersonResult?.evaluation && (
                  <>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span>
                        {new Date(
                          evaluationPersonResult.evaluation.start_date
                        ).toLocaleDateString("es-ES")}{" "}
                        -
                        {new Date(
                          evaluationPersonResult.evaluation.end_date
                        ).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {evaluationPersonResult.evaluation.period}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
